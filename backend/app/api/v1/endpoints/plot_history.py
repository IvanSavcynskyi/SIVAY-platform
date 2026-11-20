from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud.crud_crop import get_crop_by_id
from app.crud.crud_field import get_field
from app.crud.crud_plot import get_plot
from app.crud.crud_plot_history import (
    create_or_upsert_history,
    delete_history,
    get_history_by_id,
    get_history_by_plot_and_year,
    get_history_by_plot_id,
    update_history,
)
from app.models.user import User
from app.schemas.plot_history import (
    PlotHistoryCreate,
    PlotHistoryResponse,
    PlotHistoryUpdate,
)

router = APIRouter()


async def verify_plot_access(
    db: AsyncSession, plot_id: int, user_id: int
):
    """Перевіряє існування ділянки та доступ поточного користувача через батьківське поле."""
    plot = await get_plot(db=db, plot_id=plot_id)
    if not plot:
        raise HTTPException(status_code=404, detail="Ділянку не знайдено")

    field = await get_field(db=db, field_id=plot.field_id)
    if not field or field.user_id != user_id:
        raise HTTPException(status_code=403, detail="Немає доступу до цієї ділянки")

    return plot


@router.post("/", response_model=PlotHistoryResponse, status_code=status.HTTP_201_CREATED)
async def create_plot_history(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    plot_id: int,
    history_in: PlotHistoryCreate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Any:
    """Створення або оновлення (upsert) запису в історії посівів для конкретної ділянки.
    Якщо для цієї ділянки вже існує запис за вказаний рік, культура буде оновлена.
    """
    await verify_plot_access(db, plot_id, current_user.id)

    crop = await get_crop_by_id(db=db, crop_id=history_in.crop_id)
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Культуру не знайдено"
        )

    return await create_or_upsert_history(db=db, history_in=history_in, plot_id=plot_id)


@router.get("/", response_model=list[PlotHistoryResponse])
async def read_plot_history(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    plot_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Any:
    """Отримання всієї історії посівів для конкретної ділянки (новіші роки — першими)."""
    await verify_plot_access(db, plot_id, current_user.id)
    return await get_history_by_plot_id(db=db, plot_id=plot_id)


@router.put("/{history_id}", response_model=PlotHistoryResponse)
async def update_plot_history_entry(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    plot_id: int,
    history_id: int,
    history_in: PlotHistoryUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Any:
    """Оновлення конкретного запису історії посівів за ID."""
    await verify_plot_access(db, plot_id, current_user.id)

    history_item = await get_history_by_id(db=db, history_id=history_id)
    if not history_item or history_item.plot_id != plot_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Запис історії не знайдено для цієї ділянки",
        )

    if history_in.crop_id is not None:
        crop = await get_crop_by_id(db=db, crop_id=history_in.crop_id)
        if not crop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Культуру не знайдено",
            )

    if history_in.year is not None and history_in.year != history_item.year:
        existing = await get_history_by_plot_and_year(
            db=db, plot_id=plot_id, year=history_in.year
        )
        if existing and existing.id != history_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Запис історії для року {history_in.year} вже існує для цієї ділянки",
            )

    return await update_history(db=db, db_obj=history_item, history_in=history_in)


@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plot_history_entry(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    plot_id: int,
    history_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Видалення запису історії посівів (наприклад, для скидання у статус «Не вказано»)."""
    await verify_plot_access(db, plot_id, current_user.id)

    history_item = await get_history_by_id(db=db, history_id=history_id)
    if not history_item or history_item.plot_id != plot_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Запис історії не знайдено для цієї ділянки",
        )

    await delete_history(db=db, history_id=history_id)

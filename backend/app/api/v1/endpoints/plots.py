from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud.crud_field import get_field
from app.crud.crud_plot import (
    create_plot,
    delete_plot,
    get_plot,
    get_plots_by_field,
    update_plot,
)
from app.models.user import User
from app.schemas.plot import PlotCreate, PlotResponse, PlotUpdate

router = APIRouter()

async def verify_field_access(db: AsyncSession, field_id: int, user_id: int):
    field = await get_field(db=db, field_id=field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Поле не знайдено")
    if field.user_id != user_id:
        raise HTTPException(status_code=403, detail="Немає доступу до цього поля")
    return field

@router.post("/", response_model=PlotResponse, status_code=status.HTTP_201_CREATED)
async def create_new_plot(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    plot_in: PlotCreate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Any:
    """Створення ділянки у конкретному полі."""
    await verify_field_access(db, plot_in.field_id, current_user.id)
    return await create_plot(db=db, plot_in=plot_in)

@router.get("/by-field/{field_id}", response_model=list[PlotResponse])
async def read_plots_by_field(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    field_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Any:
    """Отримання ділянок конкретного поля."""
    await verify_field_access(db, field_id, current_user.id)
    return await get_plots_by_field(db=db, field_id=field_id)

@router.get("/{plot_id}", response_model=PlotResponse)
async def read_plot(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    plot_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Any:
    """Отримання деталей ділянки за ID."""
    plot = await get_plot(db=db, plot_id=plot_id)
    if not plot:
        raise HTTPException(status_code=404, detail="Ділянку не знайдено")
    await verify_field_access(db, plot.field_id, current_user.id)
    return plot

@router.put("/{plot_id}", response_model=PlotResponse)
async def update_existing_plot(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    plot_id: int,
    plot_in: PlotUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Any:
    """Оновлення існуючої ділянки."""
    plot = await get_plot(db=db, plot_id=plot_id)
    if not plot:
        raise HTTPException(status_code=404, detail="Ділянку не знайдено")
    await verify_field_access(db, plot.field_id, current_user.id)
    return await update_plot(db=db, db_obj=plot, obj_in=plot_in)

@router.delete("/{plot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_plot(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    plot_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Видалення ділянки."""
    plot = await get_plot(db=db, plot_id=plot_id)
    if not plot:
        raise HTTPException(status_code=404, detail="Ділянку не знайдено")
    await verify_field_access(db, plot.field_id, current_user.id)
    await delete_plot(db=db, id=plot_id)

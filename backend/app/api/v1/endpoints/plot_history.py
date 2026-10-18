from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud.crud_plot import get_plot
from app.crud.crud_field import get_field
from app.crud.crud_plot_history import create_history, get_history_by_plot_id
from app.models.user import User
from app.schemas.plot_history import PlotHistoryCreate, PlotHistoryResponse

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
    """Створення запису в історії посівів для конкретної ділянки.
    `plot_id` береться з Path, `crop_id` та `year` — з тіла запиту.
    """
    await verify_plot_access(db, plot_id, current_user.id)
    return await create_history(db=db, history_in=history_in, plot_id=plot_id)


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

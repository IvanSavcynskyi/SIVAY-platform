from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.plot_history import PlotHistory
from app.schemas.plot_history import PlotHistoryCreate


async def create_history(
    db: AsyncSession, *, history_in: PlotHistoryCreate, plot_id: int
) -> PlotHistory:
    """Створює новий запис в історії посівів для конкретної ділянки."""
    db_obj = PlotHistory(
        plot_id=plot_id,
        crop_id=history_in.crop_id,
        year=history_in.year,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_history_by_plot_id(
    db: AsyncSession, *, plot_id: int
) -> Sequence[PlotHistory]:
    """Повертає всю історію посівів ділянки, відсортовану за роком (спадання)."""
    stmt = (
        select(PlotHistory)
        .where(PlotHistory.plot_id == plot_id)
        .order_by(PlotHistory.year.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

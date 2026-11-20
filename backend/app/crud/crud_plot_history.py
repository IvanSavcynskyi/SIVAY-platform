from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.plot_history import PlotHistory
from app.schemas.plot_history import PlotHistoryCreate, PlotHistoryUpdate


async def get_history_by_plot_and_year(
    db: AsyncSession, *, plot_id: int, year: int
) -> PlotHistory | None:
    """Повертає запис історії за plot_id та роком."""
    stmt = select(PlotHistory).where(
        PlotHistory.plot_id == plot_id, PlotHistory.year == year
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_history_by_id(
    db: AsyncSession, *, history_id: int
) -> PlotHistory | None:
    """Повертає запис історії за його ID."""
    stmt = select(PlotHistory).where(PlotHistory.id == history_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def create_or_upsert_history(
    db: AsyncSession, *, history_in: PlotHistoryCreate, plot_id: int
) -> PlotHistory:
    """Створює новий запис або оновлює існуючий (upsert) для пари (plot_id, year)."""
    existing = await get_history_by_plot_and_year(
        db, plot_id=plot_id, year=history_in.year
    )
    if existing:
        existing.crop_id = history_in.crop_id
        db.add(existing)
        await db.commit()
        await db.refresh(existing)
        return existing

    db_obj = PlotHistory(
        plot_id=plot_id,
        crop_id=history_in.crop_id,
        year=history_in.year,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


# Backward compatibility alias
create_history = create_or_upsert_history


async def update_history(
    db: AsyncSession, *, db_obj: PlotHistory, history_in: PlotHistoryUpdate
) -> PlotHistory:
    """Оновлює існуючий запис історії посівів."""
    update_data = history_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)

    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_history(
    db: AsyncSession, *, history_id: int
) -> PlotHistory | None:
    """Видаляє запис історії посівів за ID."""
    db_obj = await get_history_by_id(db, history_id=history_id)
    if db_obj:
        await db.delete(db_obj)
        await db.commit()
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

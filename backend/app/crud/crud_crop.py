from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.crop import Crop


async def get_crops(
    db: AsyncSession, *, limit: int = 100, offset: int = 0
) -> Sequence[Crop]:
    """Повертає список культур із пагінацією."""
    stmt = select(Crop).order_by(Crop.id).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_crop_by_id(db: AsyncSession, *, crop_id: int) -> Crop | None:
    """Повертає культуру за ID."""
    stmt = select(Crop).where(Crop.id == crop_id)
    result = await db.execute(stmt)
    return result.scalars().first()

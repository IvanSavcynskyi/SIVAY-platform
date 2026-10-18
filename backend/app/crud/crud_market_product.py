from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.market_product import MarketProduct


async def get_market_products(
    db: AsyncSession, *, limit: int = 100, offset: int = 0
) -> Sequence[MarketProduct]:
    """Повертає список товарних позицій із пагінацією."""
    stmt = select(MarketProduct).order_by(MarketProduct.id).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_market_product_by_id(
    db: AsyncSession, *, product_id: int
) -> MarketProduct | None:
    """Повертає товарну позицію за ID."""
    stmt = select(MarketProduct).where(MarketProduct.id == product_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_market_products_by_crop_id(
    db: AsyncSession, *, crop_id: int, limit: int = 100, offset: int = 0
) -> Sequence[MarketProduct]:
    """Повертає товарні позиції, прив'язані до конкретної культури."""
    stmt = (
        select(MarketProduct)
        .where(MarketProduct.crop_id == crop_id)
        .order_by(MarketProduct.id)
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

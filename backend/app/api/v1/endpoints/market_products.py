from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud.crud_market_product import get_market_product_by_id, get_market_products
from app.models.user import User
from app.schemas.market_product import MarketProductResponse

router = APIRouter()


@router.get("/", response_model=list[MarketProductResponse])
async def read_market_products(
    db: Annotated[AsyncSession, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> Any:
    """Список товарних позицій (довідник)."""
    return await get_market_products(db=db, limit=limit, offset=offset)


@router.get("/{product_id}", response_model=MarketProductResponse)
async def read_market_product(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
    product_id: int,
) -> Any:
    """Отримання товарної позиції за ID."""
    product = await get_market_product_by_id(db=db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Товарну позицію не знайдено")
    return product

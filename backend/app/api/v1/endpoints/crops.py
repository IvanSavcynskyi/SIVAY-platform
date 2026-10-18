from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud.crud_crop import get_crop_by_id, get_crops
from app.models.user import User
from app.schemas.crop import CropResponse

router = APIRouter()


@router.get("/", response_model=list[CropResponse])
async def read_crops(
    db: Annotated[AsyncSession, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> Any:
    """Список агрономічних культур (довідник)."""
    return await get_crops(db=db, limit=limit, offset=offset)


@router.get("/{crop_id}", response_model=CropResponse)
async def read_crop(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    _current_user: Annotated[User, Depends(get_current_user)],
    crop_id: int,
) -> Any:
    """Отримання культури за ID."""
    crop = await get_crop_by_id(db=db, crop_id=crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Культуру не знайдено")
    return crop

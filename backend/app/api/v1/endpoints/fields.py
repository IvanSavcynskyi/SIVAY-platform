from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud.crud_field import (
    create_field,
    delete_field,
    get_field,
    get_fields_by_user,
    update_field,
)
from app.models.user import User
from app.schemas.field import FieldCreate, FieldResponse, FieldUpdate

router = APIRouter()

@router.post("/", response_model=FieldResponse, status_code=status.HTTP_201_CREATED)
async def create_new_field(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    field_in: FieldCreate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Any:
    """Створення нового поля (прив'язується до поточного користувача)."""
    return await create_field(db=db, field_in=field_in, user_id=current_user.id)

@router.get("/", response_model=list[FieldResponse])
async def read_fields(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Any:
    """Список полів поточного користувача."""
    return await get_fields_by_user(db=db, user_id=current_user.id)

@router.get("/{field_id}", response_model=FieldResponse)
async def read_field(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    field_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Any:
    """Отримання деталей поля за ID."""
    field = await get_field(db=db, field_id=field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Поле не знайдено")
    if field.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Немає доступу до цього поля")
    return field

@router.put("/{field_id}", response_model=FieldResponse)
async def update_existing_field(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    field_id: int,
    field_in: FieldUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Any:
    """Оновлення існуючого поля."""
    field = await get_field(db=db, field_id=field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Поле не знайдено")
    if field.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Немає доступу до цього поля")
    return await update_field(db=db, db_obj=field, obj_in=field_in)

@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_field(
    *,
    db: Annotated[AsyncSession, Depends(get_db)],
    field_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Видалення поля."""
    field = await get_field(db=db, field_id=field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Поле не знайдено")
    if field.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Немає доступу до цього поля")
    await delete_field(db=db, id=field_id)

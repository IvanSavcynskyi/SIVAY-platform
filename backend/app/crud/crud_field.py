import json
from typing import Sequence
from sqlalchemy import select, cast, func
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2.functions import ST_GeomFromGeoJSON, ST_SetSRID
from geoalchemy2.types import Geography

from app.models.field import Field
from app.schemas.field import FieldCreate, FieldUpdate

async def create_field(db: AsyncSession, *, field_in: FieldCreate, user_id: int) -> Field:
    geom_str = json.dumps(field_in.geom)
    geom_expr = ST_SetSRID(ST_GeomFromGeoJSON(geom_str), 4326)
    
    total_area = field_in.total_area
    if total_area is None:
        total_area = func.ST_Area(cast(geom_expr, Geography)) / 10000.0

    db_obj = Field(
        name=field_in.name,
        user_id=user_id,
        total_area=total_area,
        region=field_in.region,
        geom=geom_expr
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get_fields_by_user(db: AsyncSession, *, user_id: int) -> Sequence[Field]:
    stmt = select(Field).where(Field.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_field(db: AsyncSession, *, field_id: int) -> Field | None:
    stmt = select(Field).where(Field.id == field_id)
    result = await db.execute(stmt)
    return result.scalars().first()

async def update_field(db: AsyncSession, *, db_obj: Field, obj_in: FieldUpdate) -> Field:
    update_data = obj_in.model_dump(exclude_unset=True)
    
    if "geom" in update_data and update_data["geom"]:
        geom_str = json.dumps(update_data.pop("geom"))
        geom_expr = ST_SetSRID(ST_GeomFromGeoJSON(geom_str), 4326)
        update_data["geom"] = geom_expr
        
        if "total_area" not in update_data or update_data["total_area"] is None:
            update_data["total_area"] = func.ST_Area(cast(geom_expr, Geography)) / 10000.0
            
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def delete_field(db: AsyncSession, *, id: int) -> Field | None:
    obj = await get_field(db, field_id=id)
    if obj:
        await db.delete(obj)
        await db.commit()
    return obj

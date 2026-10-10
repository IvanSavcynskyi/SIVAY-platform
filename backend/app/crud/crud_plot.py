import json
from typing import Sequence
from sqlalchemy import select, cast, func
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2.functions import ST_GeomFromGeoJSON, ST_SetSRID
from geoalchemy2.types import Geography

from app.models.plot import Plot
from app.schemas.plot import PlotCreate, PlotUpdate

async def create_plot(db: AsyncSession, *, plot_in: PlotCreate) -> Plot:
    geom_str = json.dumps(plot_in.geom)
    geom_expr = ST_SetSRID(ST_GeomFromGeoJSON(geom_str), 4326)
    
    total_area = plot_in.total_area
    if total_area is None:
        total_area = func.ST_Area(cast(geom_expr, Geography)) / 10000.0

    db_obj = Plot(
        field_id=plot_in.field_id,
        total_area=total_area,
        geom=geom_expr
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get_plots_by_field(db: AsyncSession, *, field_id: int) -> Sequence[Plot]:
    stmt = select(Plot).where(Plot.field_id == field_id)
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_plot(db: AsyncSession, *, plot_id: int) -> Plot | None:
    stmt = select(Plot).where(Plot.id == plot_id)
    result = await db.execute(stmt)
    return result.scalars().first()

async def update_plot(db: AsyncSession, *, db_obj: Plot, obj_in: PlotUpdate) -> Plot:
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

async def delete_plot(db: AsyncSession, *, id: int) -> Plot | None:
    obj = await get_plot(db, plot_id=id)
    if obj:
        await db.delete(obj)
        await db.commit()
    return obj

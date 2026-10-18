import json
from typing import Sequence

from geoalchemy2.functions import ST_GeomFromGeoJSON, ST_SetSRID
from geoalchemy2.types import Geography
from sqlalchemy import cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.field import Field
from app.models.plot import Plot
from app.schemas.plot import PlotCreate, PlotUpdate


async def validate_plot_within_field(
    db: AsyncSession, *, geom_expr, field_id: int
) -> bool:
    """Перевіряє, чи знаходиться геометрія ділянки в межах батьківського поля."""
    stmt = select(func.ST_Within(geom_expr, Field.geom)).where(
        Field.id == field_id
    )
    result = await db.execute(stmt)
    return bool(result.scalar())


async def create_plot(
    db: AsyncSession, *, plot_in: PlotCreate, field_id: int
) -> Plot:
    """Створює ділянку з просторовою валідацією та авторозрахунком площі."""
    geom_str = json.dumps(plot_in.geom)
    geom_expr = ST_SetSRID(ST_GeomFromGeoJSON(geom_str), 4326)

    # Просторова валідація: ділянка має бути в межах батьківського поля
    if not await validate_plot_within_field(
        db, geom_expr=geom_expr, field_id=field_id
    ):
        raise ValueError(
            "Геометрія ділянки виходить за межі батьківського поля"
        )

    # Площа завжди розраховується через PostGIS (в гектарах)
    total_area = func.ST_Area(cast(geom_expr, Geography)) / 10000.0

    db_obj = Plot(
        field_id=field_id,
        total_area=total_area,
        geom=geom_expr,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_plots_by_field(
    db: AsyncSession, *, field_id: int
) -> Sequence[Plot]:
    stmt = select(Plot).where(Plot.field_id == field_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_plot(db: AsyncSession, *, plot_id: int) -> Plot | None:
    stmt = select(Plot).where(Plot.id == plot_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def update_plot(
    db: AsyncSession, *, db_obj: Plot, obj_in: PlotUpdate
) -> Plot:
    update_data = obj_in.model_dump(exclude_unset=True)

    if "geom" in update_data and update_data["geom"]:
        geom_str = json.dumps(update_data.pop("geom"))
        geom_expr = ST_SetSRID(ST_GeomFromGeoJSON(geom_str), 4326)
        update_data["geom"] = geom_expr
        # Перерахунок площі при зміні геометрії
        update_data["total_area"] = (
            func.ST_Area(cast(geom_expr, Geography)) / 10000.0
        )

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

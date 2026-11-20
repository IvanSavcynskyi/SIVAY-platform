from __future__ import annotations

from typing import TYPE_CHECKING, Any
from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.plot_history import PlotHistory


class Plot(Base):
    __tablename__ = "plots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    field_id: Mapped[int] = mapped_column(Integer, ForeignKey("fields.id", ondelete="CASCADE"), nullable=False)
    label: Mapped[str | None] = mapped_column(String, nullable=True)
    geom: Mapped[Any] = mapped_column(Geometry("POLYGON", srid=4326), nullable=False)
    total_area: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Relationships
    plot_history: Mapped[list["PlotHistory"]] = relationship(
        "PlotHistory", back_populates="plot", cascade="all, delete-orphan"
    )

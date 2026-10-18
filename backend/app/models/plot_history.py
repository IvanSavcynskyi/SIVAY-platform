from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.crop import Crop
    from app.models.plot import Plot


class PlotHistory(Base):
    __tablename__ = "plot_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plot_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("plots.id", ondelete="CASCADE"), nullable=False
    )
    crop_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crops.id", ondelete="RESTRICT"), nullable=False
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    plot: Mapped["Plot"] = relationship("Plot", back_populates="plot_history")
    crop: Mapped["Crop"] = relationship("Crop", back_populates="plot_history")

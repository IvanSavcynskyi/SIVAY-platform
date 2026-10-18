from __future__ import annotations

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.market_product import MarketProduct
    from app.models.plot_history import PlotHistory


class CropType(str, enum.Enum):
    GRAIN = "grain"
    OILSEED = "oilseed"
    LEGUME = "legume"
    ROOT = "root"


class Crop(Base):
    __tablename__ = "crops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)

    # Relationships
    market_products: Mapped[list["MarketProduct"]] = relationship(
        "MarketProduct", back_populates="crop"
    )
    plot_history: Mapped[list["PlotHistory"]] = relationship(
        "PlotHistory", back_populates="crop"
    )

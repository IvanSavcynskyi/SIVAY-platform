from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.crop import Crop
class MarketProduct(Base):
    __tablename__ = "market_products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    crop_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("crops.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    
    # Relationships
    crop: Mapped["Crop | None"] = relationship("Crop", back_populates="market_products")

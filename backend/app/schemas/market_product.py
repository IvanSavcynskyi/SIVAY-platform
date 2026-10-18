from pydantic import BaseModel, ConfigDict


class MarketProductResponse(BaseModel):
    """Схема відповіді для товарної позиції (довідник)."""

    id: int
    crop_id: int | None = None
    name: str
    
    model_config = ConfigDict(from_attributes=True)

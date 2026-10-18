from pydantic import BaseModel, ConfigDict


class CropResponse(BaseModel):
    """Схема відповіді для агрономічної культури (довідник)."""

    id: int
    name: str
    
    model_config = ConfigDict(from_attributes=True)

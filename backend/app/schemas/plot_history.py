from pydantic import BaseModel, ConfigDict


class PlotHistoryCreate(BaseModel):
    """Схема для створення запису в історії посівів.
    plot_id НЕ включено — береться з Path-параметра URL.
    """

    crop_id: int
    year: int


class PlotHistoryResponse(BaseModel):
    """Схема відповіді для запису історії посівів."""

    id: int
    plot_id: int
    crop_id: int
    year: int

    model_config = ConfigDict(from_attributes=True)

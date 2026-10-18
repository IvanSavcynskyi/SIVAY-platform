from typing import Any, Dict

from pydantic import BaseModel, ConfigDict, Field as PydanticField, model_validator


class PlotBase(BaseModel):
    geom: Dict[str, Any] = PydanticField(..., description="GeoJSON Polygon")


class PlotCreate(PlotBase):
    pass


class PlotUpdate(BaseModel):
    geom: Dict[str, Any] | None = None


class PlotResponse(PlotBase):
    id: int
    field_id: int
    total_area: float | None = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    @classmethod
    def convert_geom(cls, data: Any) -> Any:
        if getattr(data, 'geom', None) is not None:
            if not isinstance(data.geom, dict):
                try:
                    from geoalchemy2.shape import to_shape
                    import shapely.geometry
                    shape = to_shape(data.geom)
                    geom_dict = shapely.geometry.mapping(shape)

                    if hasattr(data, '__dict__'):
                        dict_data = {k: v for k, v in data.__dict__.items() if not k.startswith('_')}
                        dict_data['geom'] = geom_dict
                        return dict_data
                except ImportError:
                    pass
        return data

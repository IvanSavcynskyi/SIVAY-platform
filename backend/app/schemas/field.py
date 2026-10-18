from typing import Any, Dict

from pydantic import BaseModel, ConfigDict, Field as PydanticField, model_validator


class FieldBase(BaseModel):
    name: str
    geom: Dict[str, Any] = PydanticField(..., description="GeoJSON Polygon")
    region: str | None = None


class FieldCreate(FieldBase):
    pass


class FieldUpdate(BaseModel):
    name: str | None = None
    geom: Dict[str, Any] | None = None
    region: str | None = None


class FieldResponse(FieldBase):
    id: int
    user_id: int
    total_area: float | None = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    @classmethod
    def convert_geom(cls, data: Any) -> Any:
        # data might be an ORM object when fetched from DB
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

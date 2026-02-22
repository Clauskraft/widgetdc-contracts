"""Base model for all WidgeTDC contracts. Wire format is snake_case."""
from pydantic import BaseModel, ConfigDict


class WidgeTDCBaseModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
    )

from typing import Optional
from pydantic import BaseModel
import uuid


class StatisticsRequest(BaseModel):
    range_id: uuid.UUID

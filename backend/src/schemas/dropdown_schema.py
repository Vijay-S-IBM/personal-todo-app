from typing import Literal
from pydantic import BaseModel


class DropdownRequest(BaseModel):
    dropdown_type: Literal["status", "stats"]
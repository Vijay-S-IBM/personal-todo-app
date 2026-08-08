from pydantic import BaseModel, Field
from typing import List


class CalendarDayStats(BaseModel):
    date: str                  # ISO format "YYYY-MM-DD"
    total: int
    completed: int
    yet_to_start: int
    in_process: int
    on_hold: int
    delayed: int


class CalendarMonthResponse(BaseModel):
    status_code: int
    message: str
    year: int
    month: int
    days: List[CalendarDayStats]

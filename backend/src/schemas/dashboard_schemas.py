from datetime import date
from typing import List, Optional, Any
from pydantic import BaseModel
import uuid


class DashboardData(BaseModel):
    task_date: date
    search: Optional[str] = None
    task_filter: Optional[uuid.UUID] = None
    page: int = 1
    page_size: int = 5


class GetTaskResponse(BaseModel):
    status_code: int
    message: str
    data: Any          # can be a list of tasks or a single dict
    total: Optional[int] = None
    page: Optional[int] = None
    page_size: Optional[int] = None
    total_pages: Optional[int] = None

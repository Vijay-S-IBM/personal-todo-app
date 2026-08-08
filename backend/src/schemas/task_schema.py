from datetime import date
from typing import List, Any, Optional
from pydantic import BaseModel, Field
import uuid


class Task(BaseModel):
    task_name: str
    task_description: Optional[str] = None
    task_comments: Optional[str] = None
    due_date: date = Field(default_factory=date.today)


class AddTaskRequest(BaseModel):
    task_details: Task


class TaskResponse(BaseModel):
    status_code: int
    details: str
    message: str


class UpdateTaskRequest(BaseModel):
    task_details: Task
    task_id: uuid.UUID


class MoveTaskRequest(BaseModel):
    task_ids: List[uuid.UUID]
    due_date: date = Field(default_factory=date.today)


class UpdateTaskStatus(BaseModel):
    task_id: uuid.UUID
    status_id: uuid.UUID


class DeleteTaskRequest(BaseModel):
    task_id: uuid.UUID


class BulkDeleteTaskRequest(BaseModel):
    task_ids: List[uuid.UUID]


class GetTaskResponse(BaseModel):
    status_code: int
    message: str
    data: Any          # single task dict or list

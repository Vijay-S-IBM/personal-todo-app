import uuid
from fastapi import Depends, HTTPException
from src.app import app
from src.schemas.task_schema import (
    AddTaskRequest, TaskResponse, UpdateTaskRequest,
    MoveTaskRequest, UpdateTaskStatus,
    DeleteTaskRequest, BulkDeleteTaskRequest, GetTaskResponse,
)
from src.services.task_service import TaskServices
from src.core.auth_middleware import get_current_user


@app.post("/add_task", response_model=TaskResponse)
def add_task(
    payload: AddTaskRequest,
    current_user: dict = Depends(get_current_user),
):
    """Add a new task for the authenticated user."""
    user_id = current_user["user_id"]
    service = TaskServices()
    if service.add_task(payload, user_id):
        return TaskResponse(
            status_code=200,
            details="Task added successfully",
            message=f"'{payload.task_details.task_name}' has been added to To-Do!",
        )
    raise HTTPException(status_code=500, detail="Failed to add task")


@app.patch("/update_task", response_model=TaskResponse)
def update_task(
    payload: UpdateTaskRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update task details (name, description, comments, due date)."""
    service = TaskServices()
    if service.update_task(payload):
        return TaskResponse(
            status_code=200,
            details="Task updated successfully",
            message="Task details have been updated!",
        )
    raise HTTPException(status_code=500, detail="Failed to update task")


@app.patch("/move_task", response_model=TaskResponse)
def move_task(
    payload: MoveTaskRequest,
    current_user: dict = Depends(get_current_user),
):
    """Move one or more tasks to a new due date."""
    service = TaskServices()
    if service.move_task(payload):
        return TaskResponse(
            status_code=200,
            details="Tasks moved successfully",
            message="Selected tasks have been moved to the new date!",
        )
    raise HTTPException(status_code=500, detail="Failed to move tasks")


@app.patch("/status_update", response_model=TaskResponse)
def update_task_status(
    payload: UpdateTaskStatus,
    current_user: dict = Depends(get_current_user),
):
    """Update the status of a single task."""
    service = TaskServices()
    if service.update_status(payload):
        return TaskResponse(
            status_code=200,
            details="Status updated successfully",
            message="Task status has been updated!",
        )
    raise HTTPException(status_code=500, detail="Failed to update task status")


@app.delete("/delete_task/{task_id}", response_model=TaskResponse)
def delete_task(
    task_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
):
    """Soft-delete a single task by its ID."""
    service = TaskServices()
    if service.delete_task(str(task_id)):
        return TaskResponse(
            status_code=200,
            details="Task deleted successfully",
            message="Task has been deleted!",
        )
    raise HTTPException(status_code=500, detail="Failed to delete task")


@app.delete("/delete_tasks/bulk", response_model=TaskResponse)
def bulk_delete_tasks(
    payload: BulkDeleteTaskRequest,
    current_user: dict = Depends(get_current_user),
):
    """Soft-delete multiple tasks at once."""
    if not payload.task_ids:
        raise HTTPException(status_code=400, detail="task_ids list cannot be empty")
    service = TaskServices()
    task_ids = [str(tid) for tid in payload.task_ids]
    if service.bulk_delete_tasks(task_ids):
        return TaskResponse(
            status_code=200,
            details="Tasks deleted successfully",
            message=f"{len(task_ids)} task(s) have been deleted!",
        )
    raise HTTPException(status_code=500, detail="Failed to delete tasks")


@app.get("/get_specific_task/{task_id}", response_model=GetTaskResponse)
def get_specific_task(
    task_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
):
    """Fetch full details of a single task."""
    service = TaskServices()
    data = service.get_task_by_id(str(task_id))
    if data:
        return GetTaskResponse(
            status_code=200,
            message="Task details fetched successfully",
            data=data,
        )
    raise HTTPException(status_code=404, detail="Task not found")

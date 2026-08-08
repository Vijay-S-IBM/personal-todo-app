from typing import List
from fastapi import HTTPException
from src.database.task_database import TaskDatabaseFunctions


class TaskServices:

    def add_task(self, payload, user_id: str):
        try:
            db = TaskDatabaseFunctions()
            return db.insert_task(payload, user_id)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    def update_task(self, payload):
        try:
            db = TaskDatabaseFunctions()
            return db.update_task_details(payload)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    def move_task(self, payload):
        try:
            db = TaskDatabaseFunctions()
            return db.move_task_details(payload)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    def update_status(self, payload):
        try:
            db = TaskDatabaseFunctions()
            return db.update_task_status(payload)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    def delete_task(self, task_id: str):
        try:
            db = TaskDatabaseFunctions()
            return db.delete_task(task_id)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    def bulk_delete_tasks(self, task_ids: List[str]):
        try:
            db = TaskDatabaseFunctions()
            return db.bulk_delete_tasks(task_ids)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    def get_task_by_id(self, task_id: str):
        try:
            db = TaskDatabaseFunctions()
            return db.getTaskByID(task_id)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

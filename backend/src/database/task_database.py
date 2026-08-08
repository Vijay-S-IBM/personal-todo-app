import uuid
from typing import List

from fastapi import HTTPException
from src.database.database import DatabaseFunctions
from src.models.tables import (
    CREATE_TASK, UPDATE_TASK, UPDATE_TASK_DATE_BULK,
    UPDATE_TASK_STATUS, SOFT_DELETE_TASK, SOFT_DELETE_TASK_BULK,
    GET_TASK_BY_ID,
)


class TaskDatabaseFunctions:

    def insert_task(self, payload, user_id: str):
        try:
            db = DatabaseFunctions()
            values = (
                user_id,
                payload.task_details.task_name,
                payload.task_details.task_description,
                payload.task_details.task_comments,
                payload.task_details.due_date,
            )
            return db.execute_query_without_return(CREATE_TASK, values)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    def update_task_details(self, payload):
        try:
            db = DatabaseFunctions()
            values = (
                payload.task_details.task_name,
                payload.task_details.task_description,
                payload.task_details.task_comments,
                payload.task_details.due_date,
                str(payload.task_id),
            )
            return db.execute_query_without_return(UPDATE_TASK, values)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    def move_task_details(self, payload):
        try:
            db = DatabaseFunctions()
            values = (
                payload.due_date,
                [str(tid) for tid in payload.task_ids],
            )
            return db.execute_query_without_return(UPDATE_TASK_DATE_BULK, values)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    def update_task_status(self, payload):
        try:
            db = DatabaseFunctions()
            values = (str(payload.status_id), str(payload.task_id))
            return db.execute_query_without_return(UPDATE_TASK_STATUS, values)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    def delete_task(self, task_id: str):
        try:
            db = DatabaseFunctions()
            return db.execute_query_without_return(SOFT_DELETE_TASK, (task_id,))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    def bulk_delete_tasks(self, task_ids: List[str]):
        try:
            db = DatabaseFunctions()
            return db.execute_query_without_return(SOFT_DELETE_TASK_BULK, (task_ids,))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    def getTaskByID(self, task_id: str):
        try:
            db = DatabaseFunctions()
            data = db.execute_query_with_return(GET_TASK_BY_ID, (task_id,))
            if not data:
                return None
            row = dict(data[0])
            # Serialise date fields so they are JSON-safe
            if row.get("task_date"):
                row["task_date"] = row["task_date"].isoformat()
            if row.get("created_at"):
                row["created_at"] = row["created_at"].isoformat()
            if row.get("updated_at"):
                row["updated_at"] = row["updated_at"].isoformat()
            # UUID columns to string
            for key in ("task_id", "user_id", "status_id"):
                if row.get(key):
                    row[key] = str(row[key])
            return row
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

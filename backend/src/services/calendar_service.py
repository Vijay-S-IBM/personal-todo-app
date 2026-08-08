from fastapi import HTTPException
from src.database.calendar_database import CalendarDatabaseFunctions


class CalendarService:

    def get_monthly_stats(self, user_id: str, year: int, month: int):
        try:
            db = CalendarDatabaseFunctions()
            return db.get_monthly_stats(user_id, year, month)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: {str(e)}",
            )

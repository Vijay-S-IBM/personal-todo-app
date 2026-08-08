from fastapi import HTTPException
from src.database.database import DatabaseFunctions
from src.models.tables import GET_CALENDAR_MONTH


class CalendarDatabaseFunctions:

    def get_monthly_stats(self, user_id: str, year: int, month: int):
        """
        Returns a list of dicts — one per day that has tasks — with
        counts for each status.  Days with zero tasks are not included.
        """
        try:
            db = DatabaseFunctions()
            rows = db.execute_query_with_return(
                GET_CALENDAR_MONTH,
                (user_id, year, month),
            )
            # Ensure all count columns are plain ints (psycopg2 may return Decimal)
            result = []
            for row in rows:
                result.append({
                    "date":         str(row["date"]),
                    "total":        int(row["total"]),
                    "completed":    int(row["completed"]),
                    "yet_to_start": int(row["yet_to_start"]),
                    "in_process":   int(row["in_process"]),
                    "on_hold":      int(row["on_hold"]),
                    "delayed":      int(row["delayed"]),
                })
            return result
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: {str(e)}",
            )

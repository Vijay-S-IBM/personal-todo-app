from fastapi import Depends, HTTPException, Query
from src.app import app
from src.schemas.calendar_schema import CalendarMonthResponse, CalendarDayStats
from src.services.calendar_service import CalendarService
from src.core.auth_middleware import get_current_user


@app.get("/calendar/monthly", response_model=CalendarMonthResponse)
def get_calendar_monthly(
    year: int = Query(..., ge=2000, le=2100, description="4-digit year, e.g. 2026"),
    month: int = Query(..., ge=1, le=12, description="Month number 1-12"),
    current_user: dict = Depends(get_current_user),
):
    """
    Returns per-day task summary for the given month.

    Each day entry shows total tasks and a breakdown by status:
      - completed, yet_to_start, in_process, on_hold, delayed

    Days with zero tasks are not included in the response.

    Query params:
      - year  (required) : e.g. 2026
      - month (required) : 1–12
    """
    try:
        user_id = current_user["user_id"]
        service = CalendarService()
        days = service.get_monthly_stats(user_id, year, month)

        return CalendarMonthResponse(
            status_code=200,
            message="Calendar data fetched successfully",
            year=year,
            month=month,
            days=[CalendarDayStats(**d) for d in days],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

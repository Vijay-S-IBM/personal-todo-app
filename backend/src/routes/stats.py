from fastapi import Depends, HTTPException
from src.app import app
from src.schemas.stats_schema import StatisticsRequest
from src.services.stats_service import StatsService
from src.core.auth_middleware import get_current_user


@app.get("/dashboard/statistics")
def dashboard_statistics(
    payload: StatisticsRequest = Depends(),
    current_user: dict = Depends(get_current_user),
):
    """
    Returns statistics for the authenticated user for a given date range.

    Query params:
      - range_id (required) : UUID from GET /dropdown/stats
    """
    try:
        user_id = current_user["user_id"]
        service = StatsService()
        return service.getStatistics(payload, user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

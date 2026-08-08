from fastapi import Depends, HTTPException
from src.app import app
from src.schemas.dashboard_schemas import DashboardData, GetTaskResponse
from src.services.dashboard_service import DashboardService
from src.core.auth_middleware import get_current_user


@app.get("/dashboard", response_model=GetTaskResponse)
def dashboard(
    payload: DashboardData = Depends(),
    current_user: dict = Depends(get_current_user),
):
    """
    Returns paginated tasks for the authenticated user on a specific date.

    Query params:
      - task_date  (required)  : YYYY-MM-DD
      - search     (optional)  : filter by task name
      - task_filter(optional)  : filter by status UUID
      - page       (default 1) : page number
      - page_size  (default 5) : tasks per page
    """
    try:
        user_id = current_user["user_id"]
        service = DashboardService()
        result = service.getDashboardData(payload, user_id)
        return GetTaskResponse(
            status_code=200,
            message="Task data fetched successfully",
            data=result["tasks"],
            total=result["total"],
            page=result["page"],
            page_size=result["page_size"],
            total_pages=result["total_pages"],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

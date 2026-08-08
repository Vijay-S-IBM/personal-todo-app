from fastapi import Depends, HTTPException
from src.app import app
from src.schemas.dropdown_schema import DropdownRequest
from src.services.dropdown_service import DropdownService
from src.core.auth_middleware import get_current_user


@app.get("/dropdown/{dropdown_type}")
def dropdown(
    payload: DropdownRequest = Depends(),
    current_user: dict = Depends(get_current_user),
):
    """
    Returns dropdown options.

    Path param:
      - dropdown_type : "status" | "stats"
    """
    try:
        service = DropdownService()
        return service.getDropdownData(payload)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

from src.schemas.healthcheck_schema import HealtCheckResponse
from src.app import app


@app.get("/healthcheck")
def healCheck():
    return HealtCheckResponse(
        status=200,
        message="Healthy"
    )
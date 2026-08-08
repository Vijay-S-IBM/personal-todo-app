import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.core.settings import Settings

# FastAPI's built-in bearer token extractor
# It reads the "Authorization: Bearer <token>" header automatically
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    JWT guard — use as a FastAPI dependency on any protected route.

    Usage:
        @app.get("/some-route")
        def some_route(current_user: dict = Depends(get_current_user)):
            user_id = current_user["user_id"]

    Returns the decoded JWT payload dict on success.
    Raises 401 on missing / expired / invalid token.
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            Settings.JWT_SECRET,
            algorithms=["HS256"],
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

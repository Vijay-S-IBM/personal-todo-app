import uuid
from fastapi import Depends, HTTPException
from src.app import app
from src.schemas.auth_schema import AuthResponse, UserProfile, payload
from src.services.auth_service import UserLoginAuth
from src.core.auth_middleware import get_current_user


@app.post("/auth/google", response_model=AuthResponse)
async def google_auth(body: payload):
    """Verify Google OAuth ID token and issue an application JWT."""
    id_token_str = body.id_token
    if not id_token_str:
        raise HTTPException(status_code=400, detail="Missing id_token")

    login = UserLoginAuth()
    google_user = login.verify_google_id_token(id_token_str)
    updated_user = login.user_validation(google_user)
    jwt_token = login.create_app_jwt(updated_user)

    return AuthResponse(
        token=jwt_token,
        user={
            "user_id": str(updated_user.get("user_id")),
            "sub": google_user.get("sub"),
            "email": google_user.get("email"),
            "name": google_user.get("name"),
            "picture": google_user.get("picture"),
        },
    )


@app.get("/me", response_model=UserProfile)
def get_my_profile(current_user: dict = Depends(get_current_user)):
    """
    Returns the profile of the currently logged-in user.
    Used when clicking the profile avatar in the navbar.
    Reads user_id straight from the JWT — no path param needed.
    """
    login = UserLoginAuth()
    user_details = login.get_user(uuid.UUID(str(current_user["user_id"])))
    return UserProfile(
        user={
            "user_id": str(user_details.get("user_id")),
            "sub": user_details.get("google_id"),
            "email": user_details.get("email"),
            "name": user_details.get("name"),
            "picture": user_details.get("picture"),
        }
    )


@app.get("/get_user_details/{user_id}", response_model=UserProfile)
def get_user_profile(
    user_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
):
    """Fetch profile for any user by their UUID. Requires a valid JWT."""
    login = UserLoginAuth()
    user_details = login.get_user(user_id)
    return UserProfile(
        user={
            "user_id": str(user_details.get("user_id")),
            "sub": user_details.get("google_id"),
            "email": user_details.get("email"),
            "name": user_details.get("name"),
            "picture": user_details.get("picture"),
        }
    )

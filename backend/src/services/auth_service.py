

import time
import uuid

from google.oauth2 import id_token
from google.auth.transport import requests
from typing import Dict, Any
from src.core.settings import Settings
import jwt
from fastapi import HTTPException
from google.auth.exceptions import GoogleAuthError
from src.database.auth_database import AuthDatabaseFunctions



class UserLoginAuth(Settings):


    def verify_google_id_token(self,id_token_str: str) -> Dict[str, Any]:
        """Verify Google Identity Services ID Token against Google Public Keys."""
        try:
            req = requests.Request()

            claim = id_token.verify_oauth2_token(
                id_token_str, 
                req, 
                audience=Settings.GOOGLE_CLIENT_ID if Settings.GOOGLE_CLIENT_ID else None
            )

            return claim
        except GoogleAuthError as e:
            raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

    def create_app_jwt(self,user_payload: Dict[str, Any]) -> str:
        """Generate 24h JWT token for authenticated app user."""
        try:
            payload = {
                "user_id": user_payload.get("user_id"),
                "sub": user_payload.get("sub", user_payload.get("email", "unknown_user")),
                "email": user_payload.get("email", "evaluator@demo.com"),
                "name": user_payload.get("name", "Demo User"),
                "picture": user_payload.get("picture", ""),
                "iat": int(time.time()),
                "exp": int(time.time()) + (24 * 3600)  # 24 hours
            }
            token = jwt.encode(payload, Settings.JWT_SECRET, algorithm="HS256")
            return token
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server issue: {str(e)}")

    def user_validation(self,user):
        try:
            auth = AuthDatabaseFunctions()
            user = auth.existing_user_validation(user)
            return user
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server issue: {str(e)}")

    def get_user(self, user_id:uuid.UUID):
        try:
            auth = AuthDatabaseFunctions()
            user = auth.get_existing_user(user_id)
            return user
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server issue: {str(e)}")
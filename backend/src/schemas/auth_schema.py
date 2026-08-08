from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Literal

class AuthResponse(BaseModel):
    token: str
    user: Dict[str, Any]

class UserProfile(BaseModel):
    user: dict[str, Any]

class payload(BaseModel):
    id_token: str
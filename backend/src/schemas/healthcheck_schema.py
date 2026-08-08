
from datetime import date
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class HealtCheckResponse(BaseModel):
    status:int = Field("An status code representing the response status")
    message:str = Field("An message status the health check details")
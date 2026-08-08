from typing import Dict, Any
from fastapi import HTTPException
from src.database.database import DatabaseFunctions
from src.models.tables import *


class DropdownService():


    def getDropdownData(self, payload):
        try:
            db = DatabaseFunctions()

            if payload.dropdown_type == "status":
                query = GET_STATUS_DROPDOWN
            else:
                query = GET_DAYS_RANGE_DROPDOWN

            details = db.execute_query_with_return(query)

            print(details)

            return details

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error : {str(e)}"
        )



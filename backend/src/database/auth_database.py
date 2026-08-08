import uuid

from src.core.settings import Settings
from fastapi import HTTPException
from src.database.database import DatabaseFunctions
from src.models.tables import *

class AuthDatabaseFunctions(Settings, DatabaseFunctions):

    def existing_user_validation(self,user):
        try:
            values = (user.get("email"),)
            db_function = DatabaseFunctions()
            details = db_function.execute_query_with_return(GET_USER, values)
            if details == []:
                values = ( user.get("sub"), user.get("email"), user.get("name"), user.get("picture"), )
                details = db_function.execute_query_with_return(CREATE_USER, values)

            return details[0]
        except Exception as e:
            raise  HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

    def get_existing_user(self, user_id:uuid.UUID):
        try:
            db_function = DatabaseFunctions()
            details = db_function.execute_query_with_return(GET_USER_BY_ID, (str(user_id),))

            print("user details", details )
            return details[0]
        except Exception as e:
            raise  HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")



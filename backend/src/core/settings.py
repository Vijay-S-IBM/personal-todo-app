from dotenv import load_dotenv
import os

load_dotenv()



class Settings:

    DATABASE_URL :str = os.getenv("DATABASE_URL", "")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")

    @classmethod
    def get_secret_status(cls):
        try:
            if cls.DATABASE_URL != "" and cls.GOOGLE_CLIENT_ID != "" and cls.JWT_SECRET != "":
                return True
            else:
                return False
        except Exception as e:
            print("Error in secrets validation in application start process")


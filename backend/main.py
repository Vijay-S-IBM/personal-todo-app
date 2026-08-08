
import uvicorn
from src.app import app
from src.core.settings import Settings
from src.database.database import DatabaseFunctions

if __name__ == "__main__":
    settings = Settings()
    if settings.get_secret_status():
        print("All secrets are successfully loaded")
    data = DatabaseFunctions()
    if data.create_initial_tables():
        print("All the initial tables are created or it is there")
    uvicorn.run("src.app:app", host="0.0.0.0", port=8080, reload=True)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Personal ToDo App",
    version="0.2.0",
    description=(
        "A personal task management app. "
        "Organise daily tasks, track statuses, and view statistics."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Restrict to your frontend origin before going to production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route registration — order matters only when paths could overlap
from src.routes import healthcheck
from src.routes import auth
from src.routes import task
from src.routes import dashboard
from src.routes import stats
from src.routes import dropdown
from src.routes import calendar

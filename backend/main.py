from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import auth, videos, users
from backend.db.base import engine, Base

# Create tables (for MVP, normally we'd use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Video Stream MVP API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(videos.router, prefix="/api/videos", tags=["videos"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/")
def root():
    return {"message": "Welcome to Video Stream MVP API"}

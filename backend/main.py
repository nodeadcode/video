from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.base import engine, Base
from api import auth, videos, users
from core.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Video Stream API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(videos.router, prefix="/api/videos", tags=["videos"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Video Stream API"}

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None

class VideoCreate(VideoBase):
    pass

class Video(VideoBase):
    id: int
    file_path: str
    thumbnail_path: Optional[str] = None
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_public: bool = True

class VideoCreate(VideoBase):
    pass

class VideoUpdate(VideoBase):
    title: Optional[str] = None
    pass

class Video(VideoBase):
    id: int
    video_path: str
    thumbnail_path: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

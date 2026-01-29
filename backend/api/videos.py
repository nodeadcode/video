import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from backend.db.models import Video, User
from backend.api.deps import get_db, get_current_user, get_current_admin
from backend.schemas.video import Video as VideoSchema, VideoCreate, VideoUpdate

router = APIRouter()

UPLOAD_DIR = "uploads"
VIDEO_DIR = os.path.join(UPLOAD_DIR, "videos")
THUMB_DIR = os.path.join(UPLOAD_DIR, "thumbnails")

os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(THUMB_DIR, exist_ok=True)

@router.get("/", response_model=List[VideoSchema])
def get_videos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.is_admin:
        return db.query(Video).all()
    return db.query(Video).filter(Video.is_public == True).all()

@router.get("/{video_id}", response_model=VideoSchema)
def get_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if not video.is_public and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return video

@router.post("/", response_model=VideoSchema, status_code=status.HTTP_201_CREATED)
async def create_video(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    is_public: bool = Form(True),
    video_file: UploadFile = File(...),
    thumbnail_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    video_filename = f"{int(os.times().elf_begin)}_{video_file.filename}" if hasattr(os, 'times') else f"{int(1)}_{video_file.filename}"
    # Use a better unique filename generator
    import time
    timestamp = int(time.time())
    video_filename = f"{timestamp}_{video_file.filename}"
    video_path = os.path.join(VIDEO_DIR, video_filename)
    
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(video_file.file, buffer)
        
    thumb_path = None
    if thumbnail_file:
        thumb_filename = f"{timestamp}_{thumbnail_file.filename}"
        thumb_path = os.path.join(THUMB_DIR, thumb_filename)
        with open(thumb_path, "wb") as buffer:
            shutil.copyfileobj(thumbnail_file.file, buffer)
            
    db_video = Video(
        title=title,
        description=description,
        is_public=is_public,
        video_path=video_path,
        thumbnail_path=thumb_path
    )
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    return db_video

@router.delete("/{video_id}")
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Delete files
    if os.path.exists(video.video_path):
        os.remove(video.video_path)
    if video.thumbnail_path and os.path.exists(video.thumbnail_path):
        os.remove(video.thumbnail_path)
        
    db.delete(video)
    db.commit()
    return {"detail": "Video deleted"}

@router.get("/stream/{video_id}")
def stream_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if not video.is_public and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if not os.path.exists(video.video_path):
        raise HTTPException(status_code=404, detail="Video file not found")
        
    return FileResponse(video.video_path, media_type="video/mp4")

@router.get("/thumbnail/{video_id}")
def get_video_thumbnail(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video or not video.thumbnail_path:
        raise HTTPException(status_code=404, detail="Thumbnail not found")
        
    if not os.path.exists(video.thumbnail_path):
        raise HTTPException(status_code=404, detail="Thumbnail file not found")
        
    return FileResponse(video.thumbnail_path)

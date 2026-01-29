import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from db.base import get_db
from db.models import Video, User
from schemas.video import Video as VideoSchema
from api.users import get_current_user
from core.config import settings

router = APIRouter()

def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin access required"
        )
    return current_user

@router.get("/", response_model=List[VideoSchema])
def list_videos(db: Session = Depends(get_db)):
    return db.query(Video).order_by(Video.created_at.desc()).all()

@router.get("/{video_id}", response_model=VideoSchema)
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video

@router.post("/upload", response_model=VideoSchema)
async def upload_video(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    video_file: UploadFile = File(...),
    thumbnail_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    # Process Video
    video_ext = video_file.filename.split(".")[-1]
    video_filename = f"{uuid.uuid4()}.{video_ext}"
    video_path = os.path.join(settings.UPLOAD_DIR, video_filename)
    
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(video_file.file, buffer)
    
    # Process Thumbnail
    thumb_path = None
    if thumbnail_file:
        thumb_ext = thumbnail_file.filename.split(".")[-1]
        thumb_filename = f"{uuid.uuid4()}.{thumb_ext}"
        thumb_path = os.path.join(settings.THUMBNAIL_DIR, thumb_filename)
        with open(thumb_path, "wb") as buffer:
            shutil.copyfileobj(thumbnail_file.file, buffer)
            
    new_video = Video(
        title=title,
        description=description,
        file_path=video_filename, # Store relative path or just filename
        thumbnail_path=thumb_path.replace("\\", "/") if thumb_path else None,
        owner_id=admin_user.id
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    return new_video

@router.delete("/{video_id}")
def delete_video(
    video_id: int, 
    db: Session = Depends(get_db), 
    admin_user: User = Depends(get_admin_user)
):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Delete files
    v_path = os.path.join(settings.UPLOAD_DIR, video.file_path)
    if os.path.exists(v_path):
        os.remove(v_path)
    
    if video.thumbnail_path and os.path.exists(video.thumbnail_path):
        os.remove(video.thumbnail_path)
        
    db.delete(video)
    db.commit()
    return {"detail": "Video deleted"}

@router.get("/stream/{video_id}")
def stream_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    video_path = os.path.join(settings.UPLOAD_DIR, video.file_path)
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video file not found")
        
    def iterfile():
        with open(video_path, mode="rb") as file_like:
            yield from file_like

    return StreamingResponse(iterfile(), media_type="video/mp4")

@router.get("/thumbnail/{video_id}")
def get_thumbnail(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video or not video.thumbnail_path:
        # Return a placeholder or 404
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    
    if not os.path.exists(video.thumbnail_path):
        raise HTTPException(status_code=404, detail="Thumbnail file not found")
        
    return FileResponse(video.thumbnail_path)

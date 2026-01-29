from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db.models import User
from backend.api.deps import get_db
from backend.schemas.user import TelegramAuth
from backend.schemas.token import Token
from backend.core.security import verify_telegram_data, create_access_token
from backend.core.config import settings

router = APIRouter()

@router.post("/login", response_model=Token)
def login(auth_data: TelegramAuth, db: Session = Depends(get_db)):
    # Verify Telegram data
    if not verify_telegram_data(auth_data.dict()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram authentication data",
        )
    
    # Check if user exists
    user = db.query(User).filter(User.telegram_id == str(auth_data.id)).first()
    
    if not user:
        # Create new user
        is_admin = str(auth_data.id) == settings.ADMIN_TELEGRAM_ID
        user = User(
            telegram_id=str(auth_data.id),
            username=auth_data.username,
            first_name=auth_data.first_name,
            last_name=auth_data.last_name,
            photo_url=auth_data.photo_url,
            is_admin=is_admin
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update user info
        user.username = auth_data.username
        user.first_name = auth_data.first_name
        user.last_name = auth_data.last_name
        user.photo_url = auth_data.photo_url
        db.commit()
        db.refresh(user)
        
    # Create access token
    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer"}

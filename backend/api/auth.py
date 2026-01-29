from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, Dict
from db.base import get_db
from db.models import User
from core.security import verify_telegram_hash, create_access_token
from core.config import settings
from schemas.token import Token

router = APIRouter()

@router.post("/login/telegram", response_model=Token)
def login_telegram(data: Dict[str, Any], db: Session = Depends(get_db)):
    # 1. Verify Telegram Hash
    if not verify_telegram_hash(data):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram authentication"
        )
    
    telegram_id = str(data.get("id"))
    
    # 2. Find or create user
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        # Check if this user should be admin
        is_admin = telegram_id == settings.ADMIN_TELEGRAM_ID
        
        user = User(
            telegram_id=telegram_id,
            username=data.get("username"),
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            photo_url=data.get("photo_url"),
            is_admin=is_admin
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # 3. Create access token
    access_token = create_access_token(subject=user.telegram_id)
    return {"access_token": access_token, "token_type": "bearer"}

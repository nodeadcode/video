from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.base import get_db
from db.models import User as UserModel
from schemas.user import User
from core.security import decode_token
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> UserModel:
    telegram_id = decode_token(token)
    if not telegram_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(UserModel).filter(UserModel.telegram_id == telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me", response_model=User)
def read_user_me(current_user: UserModel = Depends(get_current_user)):
    return current_user

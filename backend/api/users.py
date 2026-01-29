from fastapi import APIRouter, Depends
from backend.api.deps import get_current_user
from backend.db.models import User
from backend.schemas.user import User as UserSchema

router = APIRouter()

@router.get("/me", response_model=UserSchema)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

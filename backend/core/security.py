import hmac
import hashlib
import time
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union
from jose import jwt
from backend.core.config import settings

def verify_telegram_data(data: Dict[str, Any]) -> bool:
    """Verifies the hash received from Telegram."""
    check_hash = data.get("hash")
    if not check_hash:
        return False
    
    # Sort data and join into string
    data_check_list = []
    for key, value in sorted(data.items()):
        if key != "hash":
            data_check_list.append(f"{key}={value}")
    data_check_string = "\n".join(data_check_list)
    
    # Create secret key from bot token
    secret_key = hashlib.sha256(settings.TELEGRAM_BOT_TOKEN.encode()).digest()
    
    # Calculate hash
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    
    # Verify hash and check if data is older than 24h
    if calculated_hash != check_hash:
        return False
    
    auth_date = int(data.get("auth_date", 0))
    if time.time() - auth_date > 86400:
        return False
        
    return True

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt

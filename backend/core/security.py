import hashlib
import hmac
import json
import time
from datetime import datetime, timedelta
from typing import Any, Union, Dict
from jose import jwt
from core.config import settings

def verify_telegram_hash(data: Dict[str, Any]) -> bool:
    """
    Verifies the hash received from Telegram Login Widget.
    """
    check_hash = data.get('hash')
    if not check_hash:
        return False
    
    # Create data-check-string
    data_list = []
    for key, value in data.items():
        if key != 'hash':
            data_list.append(f"{key}={value}")
    data_list.sort()
    data_check_string = "\n".join(data_list)
    
    # Calculate secret key
    secret_key = hashlib.sha256(settings.BOT_TOKEN.encode()).digest()
    
    # Calculate HMAC-SHA256
    computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    
    # Check if hash matches
    if computed_hash != check_hash:
        return False
    
    # Optional: check if data is outdated (more than 24 hours)
    auth_date = int(data.get('auth_date', 0))
    if time.time() - auth_date > 86400:
        return False
        
    return True

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> str:
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return decoded_token["sub"]
    except jwt.JWTError:
        return None

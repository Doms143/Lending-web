"""FastAPI dependencies for authentication"""
from fastapi import Depends, HTTPException, Header, Query
from app.utils.supabase_service import SupabaseService
from app.core.config import get_settings


def _validate_token(token: str):
    if not token:
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    settings = get_settings()
    supabase = SupabaseService(settings.supabase_url, settings.supabase_key)
    user = supabase.get_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user


async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ", 1)[1]
    return _validate_token(token)


async def get_current_admin(current_user: dict = Depends(get_current_user)):
    settings = get_settings()
    user_email = (current_user.get("email") or "").lower()

    if current_user.get("is_admin") or user_email in settings.admin_emails:
        return current_user

    raise HTTPException(status_code=403, detail="Admin access required")


async def get_current_user_token_query(token: str = Query(None)):
    return _validate_token(token)

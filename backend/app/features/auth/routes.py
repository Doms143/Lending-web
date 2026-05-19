"""Authentication feature - Handle admin authentication via Supabase Auth"""
from fastapi import APIRouter, HTTPException, Header, Depends, Request
from typing import Optional
import logging
from app.utils.supabase_service import SupabaseService
from app.utils.schemas import UserLogin, TokenResponse
from app.core.config import get_settings
from app.core.dependencies import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

limiter = Limiter(key_func=get_remote_address)


def get_supabase() -> SupabaseService:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_key:
        logger.error("Supabase configuration is missing")
        raise HTTPException(status_code=500, detail="Authentication service is not configured")
    return SupabaseService(settings.supabase_url, settings.supabase_key)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, credentials: UserLogin):
    try:
        supabase = get_supabase()
        result = supabase.login(credentials.email, credentials.password)
        return TokenResponse(
            access_token=result["access_token"],
            token_type="bearer",
            user_id=result["user_id"],
        )
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    try:
        supabase = get_supabase()
        supabase.client.auth.sign_out()
        return {"success": True, "message": "Logged out successfully"}
    except Exception as e:
        logger.error(f"Logout failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Logout failed")


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return current_user

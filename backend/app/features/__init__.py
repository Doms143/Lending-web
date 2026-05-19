"""Features module"""
from app.features.applications import router as applications_router
from app.features.applications import images_router
from app.features.admin import router as admin_router
from app.features.auth import router as auth_router

__all__ = ["applications_router", "images_router", "admin_router", "auth_router"]

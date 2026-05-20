"""FastAPI application factory and configuration"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
import logging
import json
from app.core.config import get_settings
from app.features import applications_router, images_router, admin_router, auth_router
from app.features.auth.routes import limiter as auth_limiter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    settings = get_settings()
    
    app = FastAPI(
        title=settings.api_title,
        version=settings.api_version,
        debug=settings.debug
    )
    
    # Rate limiter
    app.state.limiter = auth_limiter

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request, exc):
        return JSONResponse(
            status_code=429,
            content={
                "detail": "Too many requests. Please try again later.",
                "retry_after": 60
            },
            headers={"Retry-After": "60"}
        )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT"],
        allow_headers=["Authorization", "Content-Type"],
    )
    
    # Include routers
    app.include_router(applications_router)
    app.include_router(images_router)
    app.include_router(admin_router)
    app.include_router(auth_router)
    
    # Health check endpoint
    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}
    
    @app.get("/api/v1/status")
    async def api_status():
        return {
            "status": "running",
            "version": settings.api_version,
            "environment": settings.environment
        }

    @app.get("/api/v1/config-check")
    async def config_check():
        google_credentials_json_valid = False
        google_credentials_client_email_configured = False

        if settings.google_credentials_json:
            try:
                google_credentials = json.loads(settings.google_credentials_json)
                google_credentials_json_valid = True
                google_credentials_client_email_configured = bool(google_credentials.get("client_email"))
            except json.JSONDecodeError:
                google_credentials_json_valid = False
        else:
            google_credentials_json_valid = False

        return {
            "status": "ok",
            "environment": settings.environment,
            "supabase_url_configured": bool(settings.supabase_url),
            "supabase_key_configured": bool(settings.supabase_key),
            "supabase_service_role_key_configured": bool(settings.supabase_service_role_key),
            "google_sheets_id_configured": bool(settings.google_sheets_id),
            "google_credentials_configured": bool(settings.google_credentials_json or settings.google_credentials_path),
            "google_credentials_json_configured": bool(settings.google_credentials_json),
            "google_credentials_json_valid": google_credentials_json_valid,
            "google_credentials_client_email_configured": google_credentials_client_email_configured,
            "admin_emails_configured": bool(settings.admin_email_list),
            "cors_origins": settings.cors_origin_list,
        }
    
    # Error handler
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc):
        return JSONResponse(
            status_code=422,
            content={"detail": "Validation error", "errors": exc.errors()},
        )
    
    logger.info(f"FastAPI app created: {settings.api_title} v{settings.api_version}")
    
    return app


# Create the app instance
app = create_app()

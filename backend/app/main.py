"""FastAPI application factory and configuration"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
import logging
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
        allow_origins=settings.cors_origins,
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

"""Main entry point"""
import os
import sys
import uvicorn
from app.main import app
from app.core.config import get_settings

if __name__ == "__main__":
    settings = get_settings()
    
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0" if settings.environment == "production" else settings.api_host),
        port=int(os.getenv("PORT", settings.api_port)),
        reload=settings.debug,
        log_level="info"
    )

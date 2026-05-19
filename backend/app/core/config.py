"""Application configuration"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import os
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API
    api_title: str = "Loan Application Management System"
    api_version: str = "1.0.0"
    api_host: str = os.getenv("API_HOST", "localhost")
    api_port: int = int(os.getenv("API_PORT", 8000))
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Supabase
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_KEY", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    admin_emails: List[str] = []
    
    # Google
    google_sheets_id: str = os.getenv("GOOGLE_SHEETS_ID", "")
    google_form_response_sheet: str = os.getenv("GOOGLE_FORM_RESPONSE_SHEET", "Form Responses 1")
    google_credentials_path: str = os.getenv("GOOGLE_CREDENTIALS_PATH", "./credentials.json")
    
    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",  # Vite default
    ]

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, bool):
            return value

        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"true", "1", "yes", "on", "debug", "development"}:
                return True
            if normalized in {"false", "0", "no", "off", "release", "production"}:
                return False

        return value

    @field_validator("admin_emails", mode="before")
    @classmethod
    def parse_admin_emails(cls, value):
        if not value:
            return []

        if isinstance(value, str):
            return [
                email.strip().lower()
                for email in value.split(",")
                if email.strip()
            ]

        return value
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

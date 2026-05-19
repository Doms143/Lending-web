"""Application configuration"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import os
import json
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
    admin_emails: str = ""
    
    # Google
    google_sheets_id: str = os.getenv("GOOGLE_SHEETS_ID", "")
    google_form_response_sheet: str = os.getenv("GOOGLE_FORM_RESPONSE_SHEET", "Form Responses 1")
    google_credentials_path: str = os.getenv("GOOGLE_CREDENTIALS_PATH", "./credentials.json")
    google_credentials_json: str = os.getenv("GOOGLE_CREDENTIALS_JSON", "")
    
    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:3001,http://localhost:5173"

    @property
    def admin_email_list(self) -> List[str]:
        return [
            email.strip().lower()
            for email in self.admin_emails.split(",")
            if email.strip()
        ]

    @property
    def cors_origin_list(self) -> List[str]:
        value = self.cors_origins.strip()

        if not value:
            return []

        if value.startswith("["):
            return json.loads(value)

        return [
            origin.strip()
            for origin in value.split(",")
            if origin.strip()
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

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartCRM - Automotive Workshop Intelligence"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "smartcrm-super-secret-development-key-change-in-production-2026"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Supabase Cloud Configuration
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    USE_SUPABASE_DIRECT: bool = False

    # Database Configuration (PostgreSQL / SQLite fallback)
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/smartcrm_db"
    USE_SQLITE_FALLBACK: bool = True
    SQLITE_DB_PATH: str = "sqlite:///./smartcrm.db"

    # Workshop Maintenance Interval Defaults (in km and days)
    INTERVAL_OIL_KM: int = 5000
    INTERVAL_OIL_DAYS: int = 180
    INTERVAL_SYNTHETIC_KM: int = 10000
    INTERVAL_SYNTHETIC_DAYS: int = 365
    INTERVAL_BRAKE_KM: int = 20000
    INTERVAL_BRAKE_DAYS: int = 730
    INTERVAL_MAJOR_KM: int = 40000
    INTERVAL_MAJOR_DAYS: int = 730

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # AI Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }


settings = Settings()

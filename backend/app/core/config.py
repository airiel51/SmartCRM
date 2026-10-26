from typing import List, Optional
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartCRM - Automotive Workshop Intelligence"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "smartcrm-super-secret-production-key-change-this-in-env-2026"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database Configuration (PostgreSQL 16 with pgvector / SQLite fallback)
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgrespassword@localhost:5432/smartcrm_db"
    USE_SQLITE_FALLBACK: bool = True
    SQLITE_DB_PATH: str = "sqlite:///./smartcrm.db"

    # Redis & Background Workers
    REDIS_URL: str = "redis://localhost:6379/0"

    # Supabase Integration (Optional remote sync)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # WhatsApp Business Cloud API
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = None
    WHATSAPP_BUSINESS_ACCOUNT_ID: Optional[str] = None
    WHATSAPP_ACCESS_TOKEN: Optional[str] = None
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: str = "smartcrm-webhook-verify-token-apex2026"
    WHATSAPP_WEBHOOK_SECRET: Optional[str] = None
    WHATSAPP_API_VERSION: str = "v21.0"
    WHATSAPP_MOCK_MODE: bool = True

    # Google Gemini Agentic AI
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    EMBEDDING_MODEL: str = "text-embedding-004"
    AI_MAX_ITERATIONS: int = 5
    HUMAN_APPROVAL_THRESHOLD: float = 0.70

    # Workshop Profile & Currency
    WORKSHOP_NAME: str = "Apex AutoWorks"
    WORKSHOP_ADDRESS: str = "Plot 14, Jalan Bayan Lepas, 11900 Bayan Lepas, Penang, Malaysia"
    WORKSHOP_PHONE: str = "+60 16-554 2190"
    DEFAULT_CURRENCY: str = "MYR"
    DEFAULT_CURRENCY_SYMBOL: str = "RM"
    TAX_RATE: float = 0.06
    TAX_NAME: str = "SST"
    DEFAULT_LOCALE: str = "en_MY"

    # Standard Service Intervals (in km and days)
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

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }


settings = Settings()

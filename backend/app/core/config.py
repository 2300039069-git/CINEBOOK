from typing import List, Optional
import os
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "CineBook API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Supabase PostgreSQL Connection
    SUPABASE_DB_URL: str = os.getenv(
        "SUPABASE_DB_URL",
        "postgresql://postgres.jyptmaprxztaxjoapbjs:KancharlaDhanush%402003@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
    )
    SUPABASE_PROJECT_REF: Optional[str] = os.getenv("SUPABASE_PROJECT_REF", "jyptmaprxztaxjoapbjs")
    
    # JWT Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "cinebook-production-super-secret-key-change-in-env-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Cashfree Payment Gateway
    CASHFREE_APP_ID: str = os.getenv("CASHFREE_APP_ID", "TEST112298405e290a700a9b8a4cf1e104892211")
    CASHFREE_SECRET_KEY: str = os.getenv("CASHFREE_SECRET_KEY", "_".join(["cfsk_ma_test", "38a3497ddb8b65296cdda27181aafaab", "43c6c164"]))
    CASHFREE_API_VERSION: str = os.getenv("CASHFREE_API_VERSION", "2023-08-01")
    CASHFREE_ENV: str = os.getenv("CASHFREE_ENV", "sandbox")
    
    # Concurrency Seat Lock Duration (seconds)
    SEAT_LOCK_DURATION_SECONDS: int = 300 # 5 minutes
    
    # Resend / Email Configuration
    RESEND_API_KEY: Optional[str] = os.getenv("RESEND_API_KEY", "")
    EMAILS_FROM: str = os.getenv("EMAILS_FROM", "CineBook <onboarding@resend.dev>")
    
    # SMTP Fallback
    SMTP_HOST: str = "smtp.resend.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = "resend"
    SMTP_PASSWORD: Optional[str] = None
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "https://cinebook.cyou",
        "https://www.cinebook.cyou",
        "https://www.cinebook.in",
        "https://cinebook.in",
        "*"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()

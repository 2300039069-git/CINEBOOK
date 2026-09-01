from typing import List, Optional
import os
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "CineBook API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Supabase PostgreSQL Connection
    SUPABASE_DB_URL: Optional[str] = os.getenv(
        "SUPABASE_DB_URL",
        "postgresql://postgres.jyptmaprxztaxjoapbjs:KancharlaDhanush%402003@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
    )
    SUPABASE_PROJECT_REF: Optional[str] = os.getenv("SUPABASE_PROJECT_REF", "jyptmaprxztaxjoapbjs")
    
    # MongoDB Atlas Connection
    MONGODB_URI: str = Field(
        default=os.getenv("MONGODB_URI", "mongodb://localhost:27017/cinebook"),
        description="MongoDB connection string (Local or MongoDB Atlas)"
    )
    DATABASE_NAME: str = "cinebook"
    
    # JWT Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "cinebook-production-super-secret-key-change-in-env-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Razorpay Payment Gateway
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_cinebook_dummy_key")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "rzp_test_cinebook_secret_key")
    
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
        "https://www.cinebook.in",
        "https://cinebook.in",
        "*"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()

import os
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add backend directory to sys.path if available
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if os.path.exists(backend_path) and backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    from app.main import app
except Exception as e:
    # Fallback robust app
    app = FastAPI(title="CineBook API", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    @app.get("/api/health")
    async def health():
        return {
            "status": "healthy",
            "service": "CineBook API (Serverless)",
            "version": "1.0.0",
            "concurrency_engine": "active"
        }

    @app.get("/api/v1/theatres")
    async def get_theatres():
        return {"theatres": []}

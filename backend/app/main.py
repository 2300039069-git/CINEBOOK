import asyncio
import logging
import os
import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import connect_to_supabase, close_supabase_connection, db_manager
from app.api.v1.api_router import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("cinebook")

# Background worker to prevent Render Free-Tier 15-minute sleep
async def render_keep_alive_worker():
    """
    Pings the Render backend health endpoint every 10 minutes (600s)
    to prevent Render free tier containers from spinning down after 15 minutes of inactivity.
    """
    logger.info("Render Keep-Alive worker initialized.")
    await asyncio.sleep(60) # Initial delay after boot
    while True:
        try:
            render_url = os.getenv("RENDER_EXTERNAL_URL") or os.getenv("BACKEND_URL")
            target_url = f"{render_url}/health" if render_url else "http://127.0.0.1:8000/health"
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(target_url)
                logger.info(f"Render Keep-Alive Ping sent to {target_url} -> Status {res.status_code}")
        except Exception as ping_err:
            logger.debug(f"Render Keep-Alive notice: {ping_err}")

        # Sleep for 10 minutes (600s) - keeps container actively awake
        await asyncio.sleep(600)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to Supabase PostgreSQL & Start Keep-Alive Worker
    logger.info("Initializing CineBook backend service with Supabase PostgreSQL...")
    await connect_to_supabase()
    keep_alive_task = asyncio.create_task(render_keep_alive_worker())
    yield
    # Shutdown: Cancel task and close database connections
    keep_alive_task.cancel()
    logger.info("Shutting down CineBook backend service...")
    await close_supabase_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Set CORS middleware for Localhost, Netlify, Vercel frontend, and production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*(\.netlify\.app|\.vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# Health Check Endpoint
@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
@app.get("/api", tags=["System"])
@app.get("/", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_connected": db_manager.is_connected,
        "concurrency_engine": "active"
    }

# Mount API Router on /api/v1, /v1, and root
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router, prefix="/v1")
app.include_router(api_router, prefix="")


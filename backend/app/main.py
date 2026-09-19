import sys
from pathlib import Path

# Add backend directory to sys.path so both root and backend-relative execution work on Render
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

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
    Pings the Render backend health endpoint every 9 minutes (540s)
    via the public Render URL to prevent free tier containers from spinning down.
    """
    logger.info("Render Keep-Alive worker initialized.")
    await asyncio.sleep(60)  # Initial delay after boot
    while True:
        try:
            render_url = os.getenv("RENDER_EXTERNAL_URL") or os.getenv("BACKEND_URL") or "https://cinebook-backend-i2k9.onrender.com"
            target_url = f"{render_url.rstrip('/')}/health"
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(target_url)
                logger.info(f"Render Keep-Alive Ping sent to {target_url} -> Status {res.status_code}")
        except Exception as ping_err:
            logger.debug(f"Render Keep-Alive notice: {ping_err}")

        # Sleep for 9 minutes (540s) - keeps container active before the 15-min Render limit
        await asyncio.sleep(540)


async def gmail_continuous_poller_worker():
    """
    Background worker that continuously polls Gmail IMAP for Axis Bank / PhonePe credit alerts
    and automatically confirms active pending UPI orders.
    Strictly verifies email timestamp (must arrive AFTER order creation) and deduplicates UTRs/msg_ids.
    """
    logger.info("Gmail Continuous Poller worker initialized.")
    import time
    from app.services.gmail_payment_service import GmailPaymentPoller
    from app.api.v1.endpoints.payments import (
        UPI_ORDERS_STORE,
        USED_UTR_NUMBERS,
        PROCESSED_EMAIL_MSG_IDS,
        _confirm_upi_booking
    )

    gmail_pass = getattr(settings, "GMAIL_APP_PASSWORD", None)

    # Pre-seed existing historical email msg_ids at worker startup so past emails never confirm new orders
    if gmail_pass:
        try:
            init_alerts = await asyncio.to_thread(
                GmailPaymentPoller.check_recent_emails,
                email_address=settings.GMAIL_ADDRESS,
                app_password=gmail_pass,
                max_emails=10
            )
            for ia in (init_alerts or []):
                if ia.get("msg_id"):
                    PROCESSED_EMAIL_MSG_IDS.add(ia["msg_id"])
                if ia.get("utr_number"):
                    USED_UTR_NUMBERS.add(ia["utr_number"])
            logger.info(f"Initialized Gmail poller: safely ignored {len(PROCESSED_EMAIL_MSG_IDS)} past emails.")
        except Exception as seed_err:
            logger.debug(f"Poller seed notice: {seed_err}")

    while True:
        try:
            pending_orders = [
                (oid, o) for oid, o in UPI_ORDERS_STORE.items()
                if not o.get("paid") and o.get("status") != "PAID"
            ]

            if pending_orders and gmail_pass:
                alerts = await asyncio.to_thread(
                    GmailPaymentPoller.check_recent_emails,
                    email_address=settings.GMAIL_ADDRESS,
                    app_password=gmail_pass,
                    max_emails=5
                )

                for alert in (alerts or []):
                    msg_id = alert.get("msg_id")
                    if msg_id and msg_id in PROCESSED_EMAIL_MSG_IDS:
                        continue

                    utr = alert.get("utr_number")
                    if utr and utr in USED_UTR_NUMBERS:
                        continue

                    alert_ts = alert.get("timestamp", 0)
                    amt = alert.get("amount")

                    for oid, o in sorted(pending_orders, key=lambda x: x[1].get("created_at", 0), reverse=True):
                        order_created = o.get("created_at", 0)
                        target_amt = float(o.get("amount", 1.0))

                        # STRICT REQUIREMENT:
                        # 1. Email MUST have arrived AFTER the order was created (with 15s clock tolerance)
                        # 2. Amount must match or be acceptable test amount
                        if alert_ts >= (order_created - 15.0):
                            amount_match = (
                                (amt and abs(float(amt) - target_amt) < 0.50)
                                or (amt == 0.01 and target_amt <= 5.0)
                                or (target_amt <= 5.0 and amt and amt <= 5.0)
                            )
                            if amount_match and not o.get("paid"):
                                clean_utr = utr or f"GMAIL-UTR-{int(time.time()*1000)}"
                                payment_id = f"upi_pay_gmail_{clean_utr}"
                                
                                if msg_id:
                                    PROCESSED_EMAIL_MSG_IDS.add(msg_id)
                                USED_UTR_NUMBERS.add(clean_utr)
                                
                                logger.info(f"✨ Verified NEW real-time payment for order {oid} via Gmail alert (Amount: ₹{amt}, UTR: {clean_utr})")
                                await _confirm_upi_booking(order_id=oid, payment_id=payment_id, utr_number=clean_utr)
                                break
        except Exception as e:
            logger.debug(f"Gmail background worker notice: {e}")

        await asyncio.sleep(4)



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to Supabase PostgreSQL & Start Background Workers
    logger.info("Initializing CineBook backend service with Supabase PostgreSQL...")
    await connect_to_supabase()
    keep_alive_task = asyncio.create_task(render_keep_alive_worker())
    gmail_task = asyncio.create_task(gmail_continuous_poller_worker())
    try:
        yield
    finally:
        # Shutdown: Cancel background tasks and close database connections
        logger.info("Shutting down CineBook backend service...")
        for task in [keep_alive_task, gmail_task]:
            task.cancel()
        try:
            await asyncio.wait_for(asyncio.gather(keep_alive_task, gmail_task, return_exceptions=True), timeout=2.0)
        except Exception:
            pass
        await close_supabase_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Set CORS middleware for Localhost, Netlify, Vercel frontend, and all production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https?://.*",
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

# Explicit alias for Vyapar webhook across all standard paths
@app.post("/api/webhook/vyapar", tags=["Payments"])
@app.post("/webhook/vyapar", tags=["Payments"])
@app.post("/api/v1/webhook/vyapar", tags=["Payments"])
async def vyapar_webhook_alias(req: Request):
    from app.api.v1.endpoints.payments import receive_vyapar_webhook
    return await receive_vyapar_webhook(req)

# Explicit fallback aliases for direct booking confirmation
@app.post("/confirm-booking", tags=["Payments"])
@app.post("/api/confirm-booking", tags=["Payments"])
@app.post("/api/v1/confirm-booking", tags=["Payments"])
@app.post("/payments/confirm-booking", tags=["Payments"])
@app.post("/api/payments/confirm-booking", tags=["Payments"])
@app.post("/api/v1/payments/confirm-booking", tags=["Payments"])
async def direct_confirm_booking_alias(req: Request):
    from app.api.v1.endpoints.payments import direct_confirm_booking, DirectConfirmBookingRequest
    data = await req.json() if req.headers.get("content-type", "").startswith("application/json") else {}
    model_req = DirectConfirmBookingRequest(**data)
    return await direct_confirm_booking(model_req)




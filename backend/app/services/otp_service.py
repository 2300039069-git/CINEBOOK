import secrets
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple
from fastapi import HTTPException, status
from app.core.database import db_manager
from app.services.email_service import EmailService

logger = logging.getLogger("cinebook.otp")

# In-memory store: { (email, purpose): { "otp": str, "expires_at": datetime } }
OTP_STORE: Dict[Tuple[str, str], dict] = {}
OTP_EXPIRY_SECONDS = 300 # 5 minutes

class OTPService:
    @staticmethod
    def _generate_code() -> str:
        """Generate secure random 6-digit numeric OTP"""
        return str(secrets.randbelow(900000) + 100000)

    @classmethod
    async def create_otp(cls, email: str, purpose: str = "REGISTRATION") -> Tuple[str, int, bool, str]:
        """
        Generate, save, and dispatch a 6-digit OTP with 5-minute validity.
        Returns: (code, ttl_seconds, email_delivered, delivery_message)
        """
        email_clean = email.lower().strip()
        code = cls._generate_code()
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(seconds=OTP_EXPIRY_SECONDS)

        # 1. Dispatch Email to User's Inbox (Resend API / SMTP)
        email_result = EmailService.send_otp_email(to_email=email_clean, otp=code, purpose=purpose)
        delivered = email_result.get("delivered", False)
        delivery_msg = email_result.get("message", "")

        # 2. Store in MongoDB if connected
        if db_manager.is_connected:
            try:
                await db_manager.db.otps.update_one(
                    {"email": email_clean, "purpose": purpose},
                    {
                        "$set": {
                            "otp": code,
                            "purpose": purpose,
                            "created_at": now,
                            "expires_at": expires_at
                        }
                    },
                    upsert=True
                )
            except Exception as e:
                logger.warning(f"MongoDB OTP insert error: {e}")

        # 3. Store in Memory
        OTP_STORE[(email_clean, purpose)] = {
            "otp": code,
            "expires_at": expires_at
        }

        # Prominent console logging (ASCII-safe for Windows)
        print("\n" + "=" * 65)
        print("[CINEBOOK OTP DISPATCH]")
        print(f">> Destination Email : {email_clean}")
        print(f">> Purpose           : {purpose}")
        print(f">> 6-Digit OTP Code  : >>> {code} <<<")
        print(f">> Expiry Duration   : 5 minutes ({OTP_EXPIRY_SECONDS}s)")
        print(f">> Inbox Delivery    : {'DELIVERED (Inbox)' if delivered else 'FALLBACK (Instant code available in UI / console)'}")
        print("=" * 65 + "\n")

        logger.info(f"Generated {purpose} OTP for {email_clean} -> {code} (Delivered: {delivered})")
        return code, OTP_EXPIRY_SECONDS, delivered, delivery_msg

    @classmethod
    async def verify_otp(cls, email: str, code: str, purpose: str = "REGISTRATION") -> bool:
        """Verify 6-digit OTP and invalidate it upon successful use"""
        email_clean = email.lower().strip()
        code_clean = code.strip()
        now = datetime.now(timezone.utc)

        # 1. Check MongoDB if connected
        if db_manager.is_connected:
            try:
                doc = await db_manager.db.otps.find_one({
                    "email": email_clean,
                    "purpose": purpose,
                    "otp": code_clean,
                    "expires_at": {"$gt": now}
                })
                if doc:
                    await db_manager.db.otps.delete_one({"_id": doc["_id"]})
                    if (email_clean, purpose) in OTP_STORE:
                        del OTP_STORE[(email_clean, purpose)]
                    return True
            except Exception as e:
                logger.warning(f"MongoDB OTP verify error: {e}")

        # 2. Check Memory store
        entry = OTP_STORE.get((email_clean, purpose))
        if entry:
            if entry["expires_at"] > now and entry["otp"] == code_clean:
                del OTP_STORE[(email_clean, purpose)]
                return True

        return False

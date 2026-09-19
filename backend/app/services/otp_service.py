import secrets
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple
from fastapi import HTTPException, status
from app.core.database import db_manager
from app.services.email_service import EmailService
from app.services.sms_service import SmsService

logger = logging.getLogger("cinebook.otp")

# In-memory store: { (email, purpose): { "otp": str, "expires_at": datetime, "phone": str } }
OTP_STORE: Dict[Tuple[str, str], dict] = {}
OTP_EXPIRY_SECONDS = 300 # 5 minutes

class OTPService:
    @staticmethod
    def _generate_code() -> str:
        """Generate secure random 6-digit numeric OTP"""
        return str(secrets.randbelow(900000) + 100000)

    @classmethod
    async def create_otp(
        cls,
        email: str,
        phone: Optional[str] = None,
        purpose: str = "REGISTRATION"
    ) -> Tuple[str, int, bool, bool, str]:
        """
        Generate, save, and dispatch a 6-digit OTP via Email and SMS with 5-minute validity.
        Returns: (code, ttl_seconds, email_delivered, sms_delivered, delivery_message)
        """
        email_clean = email.lower().strip()
        code = cls._generate_code()
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(seconds=OTP_EXPIRY_SECONDS)

        # 1. Dispatch Email to User's Inbox (Resend API / SMTP)
        email_result = EmailService.send_otp_email(to_email=email_clean, otp=code, purpose=purpose)
        email_delivered = email_result.get("delivered", False)
        delivery_msg = email_result.get("message", "")

        # 2. Dispatch SMS to User's Mobile (Fast2SMS / Twilio)
        sms_delivered = False
        if phone:
            try:
                sms_result = await SmsService.send_otp_sms(phone=phone, otp=code, purpose=purpose)
                sms_delivered = sms_result.get("delivered", False)
            except Exception as e:
                logger.error(f"Failed to dispatch OTP SMS to {phone}: {e}")

        # 3. Store in Supabase if connected
        if db_manager.is_connected:
            try:
                await db_manager.execute(
                    """
                    INSERT INTO otps (email, purpose, otp, created_at, expires_at)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (email, purpose) DO UPDATE SET
                        otp = EXCLUDED.otp,
                        created_at = EXCLUDED.created_at,
                        expires_at = EXCLUDED.expires_at;
                    """,
                    email_clean, purpose, code, now, expires_at
                )
            except Exception as e:
                logger.warning(f"Supabase OTP insert error: {e}")

        # 4. Store in Memory
        OTP_STORE[(email_clean, purpose)] = {
            "otp": code,
            "expires_at": expires_at,
            "phone": phone
        }

        # Prominent console logging (ASCII-safe for Windows)
        print("\n" + "=" * 65)
        print("[CINEBOOK DUAL OTP DISPATCH]")
        print(f">> Destination Email : {email_clean} (Delivered: {email_delivered})")
        if phone:
            print(f">> Destination Mobile: {phone} (Delivered: {sms_delivered})")
        print(f">> Purpose           : {purpose}")
        print(f">> 6-Digit OTP Code  : >>> {code} <<<")
        print(f">> Expiry Duration   : 5 minutes ({OTP_EXPIRY_SECONDS}s)")
        print("=" * 65 + "\n")

        logger.info(f"Generated {purpose} OTP for {email_clean} (Phone: {phone}) -> {code}")
        return code, OTP_EXPIRY_SECONDS, email_delivered, sms_delivered, delivery_msg

    @classmethod
    async def verify_otp(cls, email: str, code: str, purpose: str = "REGISTRATION") -> bool:
        """Verify 6-digit OTP and invalidate it upon successful use"""
        email_clean = email.lower().strip()
        code_clean = code.strip()
        now = datetime.now(timezone.utc)

        # 1. Check Supabase if connected
        if db_manager.is_connected:
            try:
                doc = await db_manager.fetch_one(
                    """
                    SELECT id FROM otps 
                    WHERE email = $1 AND purpose = $2 AND otp = $3 AND expires_at > $4;
                    """,
                    email_clean, purpose, code_clean, now
                )
                if doc:
                    await db_manager.execute("DELETE FROM otps WHERE id = $1;", doc["id"])
                    if (email_clean, purpose) in OTP_STORE:
                        del OTP_STORE[(email_clean, purpose)]
                    return True
            except Exception as e:
                logger.warning(f"Supabase OTP verify error: {e}")

        # 2. Check Memory store
        entry = OTP_STORE.get((email_clean, purpose))
        if entry:
            if entry["expires_at"] > now and entry["otp"] == code_clean:
                del OTP_STORE[(email_clean, purpose)]
                return True

        return False

import re
import logging
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("cinebook.sms")

class SmsService:
    @staticmethod
    def _sanitize_indian_phone(phone: str) -> Optional[str]:
        """
        Cleans and formats phone number to standard 10-digit Indian mobile format.
        Examples: '+91 9848012345' -> '9848012345', '919848012345' -> '9848012345'
        """
        if not phone:
            return None
        digits = re.sub(r"\D", "", str(phone))
        if len(digits) == 12 and digits.startswith("91"):
            return digits[2:]
        if len(digits) == 11 and digits.startswith("0"):
            return digits[1:]
        if len(digits) == 10:
            return digits
        return None

    @classmethod
    async def send_otp_sms(cls, phone: str, otp: str, purpose: str = "REGISTRATION") -> Dict[str, Any]:
        """
        Dispatches 6-digit OTP to mobile phone via Fast2SMS Quick SMS / OTP route.
        """
        clean_phone = cls._sanitize_indian_phone(phone)
        if not clean_phone:
            logger.warning(f"Invalid phone number format: {phone}")
            return {"success": False, "delivered": False, "message": "Invalid phone number format."}

        purpose_text = "registration verification" if purpose == "REGISTRATION" else "password reset"
        message_text = f"Your CineBook verification code for {purpose_text} is {otp}. Valid for 5 minutes. Do not share this OTP."

        # 1. Fast2SMS Provider (India)
        if settings.FAST2SMS_API_KEY and len(settings.FAST2SMS_API_KEY.strip()) > 5:
            try:
                headers = {
                    "authorization": settings.FAST2SMS_API_KEY.strip(),
                    "Content-Type": "application/json"
                }
                # Fast2SMS Quick Transactional / OTP route
                payload = {
                    "route": "otp",
                    "variables_values": otp,
                    "numbers": clean_phone
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post("https://www.fast2sms.com/dev/bulkV2", json=payload, headers=headers)
                    resp_data = resp.json() if resp.status_code == 200 else {}
                    if resp.status_code == 200 and resp_data.get("return", False):
                        logger.info(f"Fast2SMS OTP successfully dispatched to +91 {clean_phone}")
                        return {
                            "success": True,
                            "delivered": True,
                            "provider": "fast2sms",
                            "message": f"OTP SMS sent to +91 {clean_phone}"
                        }
                    else:
                        err_msg = resp_data.get("message", resp.text)
                        logger.warning(f"Fast2SMS OTP notice for +91 {clean_phone}: {err_msg}")
                        # Fallback to Quick SMS text route
                        payload_quick = {
                            "route": "q",
                            "message": message_text,
                            "language": "english",
                            "flash": 0,
                            "numbers": clean_phone
                        }
                        resp2 = await client.post("https://www.fast2sms.com/dev/bulkV2", json=payload_quick, headers=headers)
                        if resp2.status_code == 200:
                            logger.info(f"Fast2SMS Quick SMS dispatched to +91 {clean_phone}")
                            return {"success": True, "delivered": True, "provider": "fast2sms", "message": f"OTP sent to +91 {clean_phone}"}
            except Exception as e:
                logger.error(f"Fast2SMS dispatch error: {e}")

        # 2. Twilio Fallback (if configured)
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER:
            try:
                twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        twilio_url,
                        auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
                        data={
                            "From": settings.TWILIO_PHONE_NUMBER,
                            "To": f"+91{clean_phone}",
                            "Body": message_text
                        }
                    )
                    if resp.status_code in (200, 201):
                        logger.info(f"Twilio SMS dispatched to +91{clean_phone}")
                        return {"success": True, "delivered": True, "provider": "twilio", "message": f"OTP SMS dispatched to +91 {clean_phone}"}
            except Exception as e:
                logger.error(f"Twilio SMS error: {e}")

        # Development / Fallback log
        print("\n" + "-" * 55)
        print(f"[CINEBOOK SMS DISPATCH]")
        print(f">> Mobile Number : +91 {clean_phone}")
        print(f">> Purpose       : {purpose}")
        print(f">> OTP Code      : >>> {otp} <<<")
        print(f">> SMS Content   : {message_text}")
        print("-" * 55 + "\n")

        return {
            "success": True,
            "delivered": False,
            "provider": "console_fallback",
            "message": f"OTP generated for +91 {clean_phone}"
        }

    @classmethod
    async def send_ticket_sms(cls, phone: str, booking: Dict[str, Any]) -> Dict[str, Any]:
        """
        Dispatches confirmed cinema ticket pass summary via SMS to customer's mobile phone.
        """
        clean_phone = cls._sanitize_indian_phone(phone)
        if not clean_phone:
            logger.warning(f"Invalid phone number for ticket SMS: {phone}")
            return {"success": False, "delivered": False, "message": "Invalid phone number."}

        movie_title = booking.get("movie_title") or booking.get("movie", {}).get("title") or "Movie"
        theatre_name = booking.get("theatre_name") or booking.get("theatre", {}).get("name") or "Siva Cinemas"
        show_date = booking.get("show_date", "")
        show_time = booking.get("show_time") or booking.get("show", {}).get("time") or ""
        booking_id = booking.get("booking_id", "")
        
        seats = booking.get("seats", [])
        seat_names = [s["id"] if isinstance(s, dict) else str(s) for s in seats]
        seats_str = ", ".join(seat_names) if seat_names else "Confirmed"

        ticket_link = f"https://cinebook.cyou/booking-confirmation/{booking_id}"

        message_text = (
            f"CineBook Confirmed! {movie_title}\n"
            f"Seats: {seats_str} | {show_date} {show_time}\n"
            f"Cinema: {theatre_name}\n"
            f"E-Ticket QR Pass: {ticket_link}"
        )

        # 1. Fast2SMS Provider
        if settings.FAST2SMS_API_KEY and len(settings.FAST2SMS_API_KEY.strip()) > 5:
            try:
                headers = {
                    "authorization": settings.FAST2SMS_API_KEY.strip(),
                    "Content-Type": "application/json"
                }
                payload = {
                    "route": "q",
                    "message": message_text,
                    "language": "english",
                    "flash": 0,
                    "numbers": clean_phone
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post("https://www.fast2sms.com/dev/bulkV2", json=payload, headers=headers)
                    if resp.status_code == 200:
                        logger.info(f"Fast2SMS Ticket confirmation sent to +91 {clean_phone}")
                        return {"success": True, "delivered": True, "provider": "fast2sms"}
            except Exception as e:
                logger.error(f"Fast2SMS Ticket dispatch error: {e}")

        # 2. Twilio Fallback
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER:
            try:
                twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        twilio_url,
                        auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
                        data={
                            "From": settings.TWILIO_PHONE_NUMBER,
                            "To": f"+91{clean_phone}",
                            "Body": message_text
                        }
                    )
                    if resp.status_code in (200, 201):
                        logger.info(f"Twilio Ticket SMS sent to +91{clean_phone}")
                        return {"success": True, "delivered": True, "provider": "twilio"}
            except Exception as e:
                logger.error(f"Twilio Ticket SMS error: {e}")

        # Development / Fallback log
        print("\n" + "=" * 65)
        print("[CINEBOOK TICKET SMS DISPATCH]")
        print(f">> Destination : +91 {clean_phone}")
        print(f">> Booking ID  : {booking_id}")
        print(f">> SMS Body    :\n{message_text}")
        print("=" * 65 + "\n")

        return {"success": True, "delivered": False, "provider": "console_fallback"}

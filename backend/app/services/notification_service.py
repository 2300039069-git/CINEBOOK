import urllib.parse
import logging
import asyncio
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
from app.services.email_service import EmailService
from app.services.sms_service import SmsService

logger = logging.getLogger("cinebook.notifications")

class NotificationService:

    @staticmethod
    def generate_whatsapp_share_text(booking: Dict[str, Any]) -> str:
        """
        Creates a beautifully formatted WhatsApp text message for the booking.
        """
        movie_title = booking.get("movie_title") or booking.get("movie", {}).get("title") or "Movie"
        theatre_name = booking.get("theatre_name") or booking.get("theatre", {}).get("name") or "Siva Cinemas 4K Laser"
        show_date = booking.get("show_date", "Today")
        show_time = booking.get("show_time") or booking.get("show", {}).get("time") or "Showtime"
        booking_id = booking.get("booking_id") or booking.get("order_id") or "CB-CONFIRMED"
        total_amount = booking.get("total_amount", 0)

        seats = booking.get("seats", [])
        seat_names = [s["id"] if isinstance(s, dict) else str(s) for s in seats]
        seats_str = ", ".join(seat_names) if seat_names else "Confirmed"

        ticket_url = f"https://cinebook.cyou/booking-confirmation/{booking_id}"

        message = (
            f"🎟️ *CINEBOOK E-TICKET CONFIRMED*\n\n"
            f"🎬 *Movie:* {movie_title}\n"
            f"📍 *Cinema:* {theatre_name}\n"
            f"📅 *Showtime:* {show_date} at {show_time}\n"
            f"💺 *Seats ({len(seat_names)}):* *{seats_str}*\n"
            f"💰 *Amount Paid:* ₹{total_amount}\n"
            f"🆔 *Booking ID:* `{booking_id}`\n\n"
            f"📱 *Digital QR Entry Pass:* {ticket_url}\n\n"
            f"✨ _Show this digital pass at the cinema turnstile for fast-track entry._"
        )
        return message

    @classmethod
    async def send_whatsapp_api_message(cls, phone: str, booking: Dict[str, Any]) -> Dict[str, Any]:
        """
        Automated backend WhatsApp dispatch using Meta WhatsApp Cloud API or Twilio WhatsApp.
        """
        clean_phone = SmsService._sanitize_indian_phone(phone)
        if not clean_phone:
            return {"success": False, "message": "Invalid phone number"}

        formatted_phone = f"91{clean_phone}"
        message_text = cls.generate_whatsapp_share_text(booking)

        # 1. Brevo WhatsApp API (if configured)
        if settings.BREVO_API_KEY and settings.BREVO_API_KEY.startswith("xkeysib-"):
            try:
                headers = {
                    "api-key": settings.BREVO_API_KEY.strip(),
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
                payload_brevo = {
                    "contactNumbers": [formatted_phone],
                    "text": message_text
                }
                if settings.BREVO_WHATSAPP_SENDER_NUMBER:
                    payload_brevo["senderNumber"] = settings.BREVO_WHATSAPP_SENDER_NUMBER

                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post("https://api.brevo.com/v3/whatsapp/sendMessage", json=payload_brevo, headers=headers)
                    if resp.status_code in (200, 201):
                        logger.info(f"Brevo WhatsApp message sent to {formatted_phone}")
                        return {"success": True, "delivered": True, "provider": "brevo_whatsapp"}
            except Exception as e:
                logger.debug(f"Brevo WhatsApp notice: {e}")

        # 2. Meta WhatsApp Cloud API (if configured)
        if settings.WHATSAPP_PHONE_NUMBER_ID and settings.WHATSAPP_ACCESS_TOKEN:
            try:
                url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
                headers = {
                    "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": formatted_phone,
                    "type": "text",
                    "text": {"preview_url": True, "body": message_text}
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, json=payload, headers=headers)
                    if resp.status_code in (200, 201):
                        logger.info(f"Meta WhatsApp Cloud API message sent to {formatted_phone}")
                        return {"success": True, "delivered": True, "provider": "meta_cloud_api"}
            except Exception as e:
                logger.error(f"Meta WhatsApp Cloud API error: {e}")

        # 2. Twilio WhatsApp (if configured)
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_WHATSAPP_NUMBER:
            try:
                twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        twilio_url,
                        auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
                        data={
                            "From": f"whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}",
                            "To": f"whatsapp:+{formatted_phone}",
                            "Body": message_text
                        }
                    )
                    if resp.status_code in (200, 201):
                        logger.info(f"Twilio WhatsApp message sent to {formatted_phone}")
                        return {"success": True, "delivered": True, "provider": "twilio_whatsapp"}
            except Exception as e:
                logger.error(f"Twilio WhatsApp error: {e}")

        # Development / Fallback log
        try:
            print("\n" + "=" * 65)
            print("[CINEBOOK WHATSAPP NOTIFICATION]")
            print(f">> Recipient  : +{formatted_phone}")
            print(f">> Message    :\n{message_text.encode('ascii', 'replace').decode('ascii')}")
            print("=" * 65 + "\n")
        except Exception:
            pass

        return {"success": True, "delivered": False, "provider": "console_fallback"}

    @classmethod
    async def dispatch_booking_notifications(
        cls,
        booking: Dict[str, Any],
        customer_email: Optional[str] = None,
        customer_phone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Dispatches all booking confirmations across Email, SMS, and WhatsApp asynchronously.
        Never throws unhandled exceptions that could affect transaction state.
        """
        email = customer_email or booking.get("customer_email") or booking.get("email")
        phone = customer_phone or booking.get("customer_phone") or booking.get("phone")

        results = {
            "email": {"success": False},
            "sms": {"success": False},
            "whatsapp": {"success": False}
        }

        # 1. Email Dispatch (HTML E-Ticket Pass)
        if email:
            try:
                email_res = await asyncio.to_thread(EmailService.send_ticket_email, email, booking)
                results["email"] = email_res
            except Exception as e:
                logger.error(f"Failed to dispatch ticket email to {email}: {e}")

        # 2. SMS Dispatch (Fast2SMS)
        if phone:
            try:
                sms_res = await SmsService.send_ticket_sms(phone, booking)
                results["sms"] = sms_res
            except Exception as e:
                logger.error(f"Failed to dispatch ticket SMS to {phone}: {e}")

        # 3. WhatsApp Dispatch
        if phone:
            try:
                wa_res = await cls.send_whatsapp_api_message(phone, booking)
                results["whatsapp"] = wa_res
            except Exception as e:
                logger.error(f"Failed to dispatch WhatsApp ticket to {phone}: {e}")

        logger.info(f"Booking notification dispatch complete for {booking.get('booking_id')}: {results}")
        return results

import logging
import httpx
import smtplib
from typing import Dict, Any, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("cinebook.email")

class EmailService:
    @staticmethod
    def _dispatch_html_email(to_clean: str, subject: str, html_content: str) -> Dict[str, Any]:
        """Core sender for Resend REST API with SMTP fallback"""
        # 1. Primary Method: Resend REST API
        if settings.RESEND_API_KEY and settings.RESEND_API_KEY.startswith("re_"):
            try:
                headers = {
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "from": settings.EMAILS_FROM,
                    "to": [to_clean],
                    "subject": subject,
                    "html": html_content
                }
                with httpx.Client(timeout=10) as client:
                    resp = client.post("https://api.resend.com/emails", json=payload, headers=headers)
                    if resp.status_code in (200, 201):
                        data = resp.json()
                        logger.info(f"Successfully sent email to {to_clean} via Resend. Message ID: {data.get('id')}")
                        return {"success": True, "delivered": True, "message": f"Email delivered to {to_clean}."}
                    else:
                        resp_json = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
                        err_msg = resp_json.get("message", resp.text)
                        logger.warning(f"Resend notification for {to_clean}: {err_msg}")
                        return {"success": True, "delivered": False, "message": err_msg, "reason": err_msg}
            except Exception as e:
                logger.error(f"Resend API dispatch error: {e}")

        # 2. Secondary Method: SMTP (Gmail or Resend SMTP)
        smtp_user = getattr(settings, "GMAIL_ADDRESS", None) or getattr(settings, "SMTP_USER", None)
        smtp_pass = getattr(settings, "GMAIL_APP_PASSWORD", None) or getattr(settings, "SMTP_PASSWORD", None)
        if smtp_pass:
            smtp_pass = str(smtp_pass).replace(" ", "").strip()

        if smtp_user and "gmail.com" in str(smtp_user):
            smtp_host = "smtp.gmail.com"
            smtp_port = 587
        else:
            smtp_host = getattr(settings, "SMTP_HOST", "smtp.resend.com")
            smtp_port = getattr(settings, "SMTP_PORT", 587)

        if smtp_user and smtp_pass and smtp_user != "your_email@gmail.com" and smtp_pass != "your_app_password":
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"CineBook Tickets <{smtp_user}>"
                msg["To"] = to_clean
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(smtp_host, smtp_port, timeout=12) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_user, to_clean, msg.as_string())
                logger.info(f"Successfully dispatched email via {smtp_host} to {to_clean}")
                return {"success": True, "delivered": True, "message": f"Email delivered to {to_clean}."}
            except Exception as e:
                logger.error(f"SMTP dispatch failed ({smtp_host}): {e}")
                return {"success": False, "delivered": False, "message": f"SMTP Error: {str(e)}", "reason": str(e)}

        return {"success": True, "delivered": False, "message": f"Email generated for {to_clean}."}

    @classmethod
    def send_otp_email(cls, to_email: str, otp: str, purpose: str = "REGISTRATION") -> dict:
        """
        Dispatches branded HTML email with 6-digit verification code directly to customer's inbox.
        """
        to_clean = to_email.lower().strip()
        subject = (
            "Your CineBook Verification Code"
            if purpose == "REGISTRATION"
            else "Your CineBook Password Reset Code"
        )

        action_title = (
            "Account Registration Verification"
            if purpose == "REGISTRATION"
            else "Password Reset Request"
        )

        action_description = (
            "Thank you for choosing CineBook! Please enter the 6-digit verification code below to complete your registration."
            if purpose == "REGISTRATION"
            else "We received a request to reset your CineBook account password. Use the verification code below to proceed."
        )

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B0F17; color: #F8FAFC; margin: 0; padding: 20px; }}
            .card {{ max-width: 520px; margin: 0 auto; background-color: #121826; border: 1px solid #2A364F; border-radius: 16px; padding: 32px; }}
            .logo {{ font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; text-align: center; }}
            .logo span {{ color: #E50914; }}
            .title {{ font-size: 18px; font-weight: 700; color: #FFFFFF; margin-top: 24px; text-align: center; }}
            .desc {{ font-size: 13px; color: #94A3B8; line-height: 1.6; margin-top: 8px; text-align: center; }}
            .otp-box {{ background-color: #1A2234; border: 1px dashed #E50914; border-radius: 12px; padding: 18px; margin: 24px 0; text-align: center; }}
            .otp-code {{ font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #FBBF24; font-family: monospace; }}
            .expiry {{ font-size: 11px; color: #94A3B8; margin-top: 6px; }}
            .footer {{ font-size: 11px; color: #64748B; text-align: center; margin-top: 24px; border-top: 1px solid #1E293B; padding-top: 16px; }}
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">Cine<span>Book</span></div>
            <div class="title">{action_title}</div>
            <div class="desc">{action_description}</div>
            
            <div class="otp-box">
              <div class="otp-code">{otp}</div>
              <div class="expiry">Expires in 5 minutes • Do not share this code with anyone</div>
            </div>

            <div class="desc" style="font-size: 11px;">
              If you did not request this code, please ignore this email.
            </div>

            <div class="footer">
              © 2026 CineBook Technologies Pvt Ltd • Cinema & Live Experiences
            </div>
          </div>
        </body>
        </html>
        """
        return cls._dispatch_html_email(to_clean, subject, html_content)

    @classmethod
    def send_ticket_email(cls, to_email: str, booking: Dict[str, Any]) -> dict:
        """
        Dispatches luxury HTML E-Ticket with QR code, poster, seat allocations, and show metadata.
        """
        to_clean = to_email.lower().strip()
        booking_id = booking.get("booking_id") or booking.get("order_id") or "CB-CONFIRMED"
        movie_title = booking.get("movie_title") or booking.get("movie", {}).get("title") or "Movie Experience"
        theatre_name = booking.get("theatre_name") or booking.get("theatre", {}).get("name") or "Siva Cinemas 4K Laser"
        show_date = booking.get("show_date", "Today")
        show_time = booking.get("show_time") or booking.get("show", {}).get("time") or "Showtime"
        total_amount = booking.get("total_amount", 0)
        payment_id = booking.get("payment_id") or booking.get("payment_utr") or "CONFIRMED"

        seats = booking.get("seats", [])
        seat_names = [s["id"] if isinstance(s, dict) else str(s) for s in seats]
        seats_str = ", ".join(seat_names) if seat_names else "Confirmed"
        seat_badges_html = "".join([
            f'<span style="display:inline-block; background-color:#E50914; color:#ffffff; font-weight:800; font-size:13px; padding:4px 10px; border-radius:6px; margin:2px 4px;">{s}</span>'
            for s in seat_names
        ])

        ticket_url = f"https://cinebook.cyou/booking-confirmation/{booking_id}"
        qr_image_url = f"https://api.qrserver.com/v1/create-qr-code/?size=180x180&data={ticket_url}"

        subject = f"🎟️ Booking Confirmed: {movie_title} ({booking_id}) - CineBook"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090E; color: #F8FAFC; margin: 0; padding: 24px; }}
            .container {{ max-width: 560px; margin: 0 auto; background-color: #0F172A; border: 1px solid #1E293B; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }}
            .header {{ background: linear-gradient(135deg, #E50914 0%, #991B1B 100%); padding: 24px; text-align: center; }}
            .logo {{ font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; }}
            .badge-confirmed {{ background-color: rgba(255,255,255,0.2); color: #FFFFFF; display: inline-block; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }}
            .content {{ padding: 28px; }}
            .movie-title {{ font-size: 22px; font-weight: 900; color: #FFFFFF; margin: 0 0 4px 0; }}
            .theatre-name {{ font-size: 14px; font-weight: 600; color: #94A3B8; margin: 0 0 20px 0; }}
            .grid {{ display: table; width: 100%; margin-bottom: 20px; background-color: #1E293B; border-radius: 12px; padding: 14px; box-sizing: border-box; }}
            .grid-col {{ display: table-cell; width: 50%; vertical-align: top; }}
            .label {{ font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748B; letter-spacing: 0.5px; margin-bottom: 4px; }}
            .val {{ font-size: 14px; font-weight: 800; color: #F1F5F9; }}
            .seats-box {{ background-color: #1E293B; border: 1px dashed #334155; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center; }}
            .qr-section {{ text-align: center; background-color: #FFFFFF; border-radius: 16px; padding: 20px; margin: 24px 0; }}
            .btn {{ display: inline-block; width: 85%; background: linear-gradient(135deg, #E50914 0%, #B91C1C 100%); color: #FFFFFF !important; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; text-align: center; }}
            .footer {{ font-size: 11px; color: #64748B; text-align: center; padding: 20px 28px; border-top: 1px solid #1E293B; background-color: #0B1120; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">CINEBOOK</div>
              <div class="badge-confirmed">✓ Confirmed E-Ticket Pass</div>
            </div>

            <div class="content">
              <h1 class="movie-title">{movie_title}</h1>
              <p class="theatre-name">📍 {theatre_name}</p>

              <div class="grid">
                <div class="grid-col">
                  <div class="label">Date & Time</div>
                  <div class="val">{show_date} • {show_time}</div>
                </div>
                <div class="grid-col">
                  <div class="label">Booking ID</div>
                  <div class="val" style="color: #FBBF24; font-family: monospace;">{booking_id}</div>
                </div>
              </div>

              <div class="seats-box">
                <div class="label" style="margin-bottom: 8px;">Reserved Seat Numbers ({len(seat_names)})</div>
                <div>{seat_badges_html}</div>
              </div>

              <div class="qr-section">
                <img src="{qr_image_url}" alt="Ticket QR Pass" width="160" height="160" style="display:block; margin:0 auto; border-radius: 8px;" />
                <p style="color: #0F172A; font-size: 11px; font-weight: 800; margin: 10px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">
                  Show QR Code At Cinema Turnstile
                </p>
              </div>

              <div style="text-align: center; margin: 24px 0 8px 0;">
                <a href="{ticket_url}" class="btn" target="_blank">
                  View & Download Digital Pass
                </a>
              </div>

              <div style="font-size: 11px; color: #94A3B8; text-align: center; margin-top: 16px;">
                Amount Paid: <strong style="color: #10B981;">₹{total_amount}</strong> • Payment ID: <code style="color: #94A3B8;">{payment_id}</code>
              </div>
            </div>

            <div class="footer">
              Please arrive 15 minutes before the showtime. Fast-track entry with this digital pass.<br>
              © 2026 CineBook Media Technologies Pvt. Ltd. • All Rights Reserved.
            </div>
          </div>
        </body>
        </html>
        """
        return cls._dispatch_html_email(to_clean, subject, html_content)

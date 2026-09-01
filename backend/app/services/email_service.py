import logging
import httpx
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("cinebook.email")

class EmailService:
    @staticmethod
    def send_otp_email(to_email: str, otp: str, purpose: str = "REGISTRATION") -> dict:
        """
        Dispatches branded HTML email with 6-digit verification code directly to customer's inbox.
        Uses Resend REST API or standard SMTP.
        Returns dict: {"success": bool, "message": str}
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
                        logger.info(f"Successfully sent OTP email to {to_clean} via Resend. Message ID: {data.get('id')}")
                        return {
                            "success": True,
                            "delivered": True,
                            "message": f"Verification code sent to {to_clean}."
                        }
                    else:
                        resp_json = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
                        err_msg = resp_json.get("message", resp.text)
                        logger.warning(f"Resend notification for {to_clean}: {err_msg}")
                        
                        # Resend sandbox limitation or domain warning
                        return {
                            "success": True,
                            "delivered": False,
                            "message": f"Verification code generated. Resend notice: {err_msg}",
                            "reason": err_msg
                        }
            except Exception as e:
                logger.error(f"Resend API dispatch error: {e}")
                # Don't fail the registration flow; proceed with fallback
                return {
                    "success": True,
                    "delivered": False,
                    "message": f"Email service unreachable ({str(e)}). Instant verification code is available.",
                    "reason": str(e)
                }

        # 2. Secondary Method: SMTP
        smtp_user = getattr(settings, "SMTP_USER", None)
        smtp_pass = getattr(settings, "SMTP_PASSWORD", None)
        if smtp_user and smtp_pass and smtp_user != "your_email@gmail.com" and smtp_pass != "your_app_password":
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"CineBook <{smtp_user}>"
                msg["To"] = to_clean
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_user, to_clean, msg.as_string())
                logger.info(f"Successfully dispatched email via SMTP to {to_clean}")
                return {
                    "success": True,
                    "delivered": True,
                    "message": f"Verification code sent to {to_clean}."
                }
            except Exception as e:
                logger.error(f"SMTP dispatch failed: {e}")
                return {
                    "success": True,
                    "delivered": False,
                    "message": f"SMTP Error: {str(e)}",
                    "reason": str(e)
                }

        return {
            "success": True,
            "delivered": False,
            "message": f"Verification code generated for {to_clean}."
        }

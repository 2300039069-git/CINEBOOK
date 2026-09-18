import imaplib
import email
from email.header import decode_header
import re
import time
import logging
from typing import Optional, Dict, Any, List
from app.core.config import settings

logger = logging.getLogger("cinebook.gmail_poller")

class GmailPaymentPoller:
    """
    Automated Gmail IMAP Poller for CineBook UPI Payments.
    Connects to kancharladhanush2003@gmail.com, inspects recent payment credit emails
    from PhonePe, Google Pay, Axis Bank, SBI, HDFC, ICICI, etc., extracts Amount and 12-digit UTR,
    and automatically verifies pending UPI bookings.
    """

    @staticmethod
    def _clean_header(header_val: str) -> str:
        if not header_val:
            return ""
        decoded_parts = decode_header(header_val)
        result = []
        for part, encoding in decoded_parts:
            if isinstance(part, bytes):
                try:
                    result.append(part.decode(encoding or "utf-8", errors="ignore"))
                except Exception:
                    result.append(part.decode("latin-1", errors="ignore"))
            else:
                result.append(str(part))
        return "".join(result)

    @staticmethod
    def _extract_body(msg: email.message.Message) -> str:
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition") or "")
                if "attachment" not in content_disposition:
                    if content_type in ["text/plain", "text/html"]:
                        try:
                            payload = part.get_payload(decode=True)
                            if payload:
                                charset = part.get_content_charset() or "utf-8"
                                body += payload.decode(charset, errors="ignore") + "\n"
                        except Exception:
                            pass
        else:
            try:
                payload = msg.get_payload(decode=True)
                if payload:
                    charset = msg.get_content_charset() or "utf-8"
                    body = payload.decode(charset, errors="ignore")
            except Exception:
                pass
        return body

    @classmethod
    def check_recent_emails(
        cls,
        email_address: Optional[str] = None,
        app_password: Optional[str] = None,
        max_emails: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Connects to Gmail IMAP, scans recent unread or payment-related emails,
        and returns parsed transaction alerts.
        """
        email_user = email_address or getattr(settings, "GMAIL_ADDRESS", "kancharladhanush2003@gmail.com")
        email_pass = app_password or getattr(settings, "GMAIL_APP_PASSWORD", "")

        if not email_pass:
            logger.warning("GMAIL_APP_PASSWORD not configured. Skipping IMAP connect.")
            return []

        clean_pass = email_pass.replace(" ", "").strip()

        parsed_alerts = []

        try:
            mail = imaplib.IMAP4_SSL("imap.gmail.com", 993)
            mail.login(email_user, clean_pass)
            mail.select("INBOX")

            status, search_data = mail.search(None, "ALL")
            if status != "OK" or not search_data or not search_data[0]:
                mail.logout()
                return []

            msg_ids = search_data[0].split()
            recent_ids = msg_ids[-max_emails:]
            recent_ids.reverse()

            for msg_id in recent_ids:
                status, data = mail.fetch(msg_id, "(RFC822)")
                if status != "OK" or not data or not data[0]:
                    continue

                raw_email = data[0][1]
                msg = email.message_from_bytes(raw_email)

                subject = cls._clean_header(msg.get("Subject", ""))
                sender = cls._clean_header(msg.get("From", ""))
                date_str = msg.get("Date", "")
                body = cls._extract_body(msg)

                combined_text = f"{subject}\n{sender}\n{body}"

                keywords = ["credit", "credited", "received", "payment", "phonepe", "gpay", "axis", "upi", "inr", "rs."]
                if not any(k in combined_text.lower() for k in keywords):
                    continue

                extracted_amount = None
                amt_match = re.search(
                    r'(?:(?:Received|Payment of|credited(?:\s+by|\s+with)?)\s*)?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)',
                    combined_text,
                    re.IGNORECASE
                )
                if amt_match:
                    try:
                        extracted_amount = float(amt_match.group(1).replace(',', ''))
                    except Exception:
                        pass

                if not extracted_amount:
                    alt_amt = re.search(r'([\d,]+(?:\.\d{1,2})?)\s*(?:received|credited)', combined_text, re.IGNORECASE)
                    if alt_amt:
                        try:
                            extracted_amount = float(alt_amt.group(1).replace(',', ''))
                        except Exception:
                            pass

                extracted_utr = None
                utr_match = re.search(
                    r'(?:UPI\s*Ref|Ref\s*No|UTR|Txn\s*ID|Reference\s*Number|UPI)[\s/:]*(\d{8,16})',
                    combined_text,
                    re.IGNORECASE
                )
                if utr_match:
                    extracted_utr = utr_match.group(1)
                else:
                    any_12 = re.search(r'\b(\d{12})\b', combined_text)
                    if any_12:
                        extracted_utr = any_12.group(1)

                if extracted_amount or extracted_utr:
                    parsed_alerts.append({
                        "msg_id": msg_id.decode("utf-8") if isinstance(msg_id, bytes) else str(msg_id),
                        "subject": subject,
                        "sender": sender,
                        "date": date_str,
                        "amount": extracted_amount,
                        "utr_number": extracted_utr,
                        "raw_snippet": body[:200]
                    })

            mail.logout()

        except Exception as e:
            logger.error(f"Error during Gmail IMAP check: {e}")

        return parsed_alerts

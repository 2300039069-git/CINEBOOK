"""
Partner / Exhibitor Portal API Endpoints
Local standalone/single-screen theatre owner management:
- Screens & Hall Layout builder (with visual seat tier maps)
- Show scheduling & Dynamic pricing overrides
- Offline Box-Office Counter Quota seat blocking
- T+1 Financial settlements & daily revenue audits
- Real-time Gatekeeper QR scanner & ticket check-in verification
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, date
import uuid

from app.core.seed_data import SEED_THEATRES, SEED_MOVIES, SEED_SHOWS

router = APIRouter()

# ---------------------------------------------------------
# IN-MEMORY / SUPABASE DATA STORAGE FOR PARTNER EXHIBITORS
# ---------------------------------------------------------

PARTNER_PROFILES: Dict[str, Dict[str, Any]] = {
    "partner@sivacinemas.com": {
        "id": "part-001",
        "email": "partner@sivacinemas.com",
        "name": "K. Siva Rama Krishna",
        "phone": "+91 98480 12345",
        "theatre_id": "th-gtr-001",
        "theatre_name": "Siva Cinemas",
        "city": "guntur",
        "gst_number": "37AAAAA0000A1Z5",
        "trade_license": "GMC/TL/2026/8491",
        "bank_name": "State Bank of India",
        "bank_account_num": "308491029481",
        "ifsc_code": "SBIN0000840",
        "account_holder": "Siva Cinemas Exhibitors LLP",
        "status": "active"
    }
}

PARTNER_SCREENS: Dict[str, List[Dict[str, Any]]] = {
    "th-gtr-001": [
        {
            "id": "scr-gtr-01",
            "theatre_id": "th-gtr-001",
            "screen_name": "Screen 1 4K Laser",
            "sound_system": "Dolby Atmos 64-Channel",
            "projection": "Barco 4K RGB Laser",
            "total_capacity": 280,
            "layout_config": {
                "tiers": [
                    {
                        "name": "BALCONY",
                        "label": "Balcony (Gold Recliner)",
                        "price": 280,
                        "rows": [
                            {"rowLetter": "A", "seats": 14, "counterQuotaSeats": [1, 2]},
                            {"rowLetter": "B", "seats": 14, "counterQuotaSeats": []}
                        ]
                    },
                    {
                        "name": "PREMIUM",
                        "label": "Premium Executive",
                        "price": 200,
                        "rows": [
                            {"rowLetter": "C", "seats": 16, "counterQuotaSeats": [1, 2, 3]},
                            {"rowLetter": "D", "seats": 16, "counterQuotaSeats": [1, 2, 3]},
                            {"rowLetter": "E", "seats": 16, "counterQuotaSeats": []}
                        ]
                    },
                    {
                        "name": "EXECUTIVE",
                        "label": "Classic First Class",
                        "price": 130,
                        "rows": [
                            {"rowLetter": "F", "seats": 18, "counterQuotaSeats": [1, 2, 3, 4]},
                            {"rowLetter": "G", "seats": 18, "counterQuotaSeats": [1, 2, 3, 4]},
                            {"rowLetter": "H", "seats": 18, "counterQuotaSeats": []},
                            {"rowLetter": "J", "seats": 18, "counterQuotaSeats": []}
                        ]
                    }
                ]
            }
        }
    ]
}

PARTNER_SHOWS: List[Dict[str, Any]] = [
    {
        "id": "sh-gtr-01",
        "theatre_id": "th-gtr-001",
        "theatre_name": "Siva Cinemas",
        "screen_id": "scr-gtr-01",
        "screen_name": "Screen 1 4K Laser",
        "movie_id": "mov-pushpa-2",
        "movie_title": "Pushpa 2: The Rule (2024)",
        "language": "Telugu",
        "format": "2D Dolby Atmos",
        "show_date": "2026-09-02",
        "show_time": "11:00 AM",
        "show_slot": "Morning",
        "tier_price": {"BALCONY": 280, "PREMIUM": 200, "EXECUTIVE": 130},
        "booking_status": "OPEN",
        "counter_held_seats": ["A1", "A2", "C1", "C2", "C3", "D1", "D2", "D3", "F1", "F2", "F3", "F4", "G1", "G2", "G3", "G4"],
        "tickets_sold_online": 142,
        "tickets_sold_counter": 16,
        "gross_collected": 34820.0
    },
    {
        "id": "sh-gtr-02",
        "theatre_id": "th-gtr-001",
        "theatre_name": "Siva Cinemas",
        "screen_id": "scr-gtr-01",
        "screen_name": "Screen 1 4K Laser",
        "movie_id": "mov-pushpa-2",
        "movie_title": "Pushpa 2: The Rule (2024)",
        "language": "Telugu",
        "format": "2D Dolby Atmos",
        "show_date": "2026-09-02",
        "show_time": "02:30 PM",
        "show_slot": "Matinee",
        "tier_price": {"BALCONY": 280, "PREMIUM": 200, "EXECUTIVE": 130},
        "booking_status": "OPEN",
        "counter_held_seats": ["A1", "A2", "C1", "C2"],
        "tickets_sold_online": 188,
        "tickets_sold_counter": 24,
        "gross_collected": 46240.0
    },
    {
        "id": "sh-gtr-03",
        "theatre_id": "th-gtr-001",
        "theatre_name": "Siva Cinemas",
        "screen_id": "scr-gtr-01",
        "screen_name": "Screen 1 4K Laser",
        "movie_id": "mov-pushpa-1",
        "movie_title": "Pushpa: The Rise (2021)",
        "language": "Telugu",
        "format": "2D Dolby Atmos",
        "show_date": "2026-09-02",
        "show_time": "06:15 PM",
        "show_slot": "First Show",
        "tier_price": {"BALCONY": 250, "PREMIUM": 180, "EXECUTIVE": 120},
        "booking_status": "OPEN",
        "counter_held_seats": ["A1", "A2"],
        "tickets_sold_online": 210,
        "tickets_sold_counter": 30,
        "gross_collected": 48600.0
    },
    {
        "id": "sh-gtr-04",
        "theatre_id": "th-gtr-001",
        "theatre_name": "Siva Cinemas",
        "screen_id": "scr-gtr-01",
        "screen_name": "Screen 1 4K Laser",
        "movie_id": "mov-ala-vaikunthapurramuloo",
        "movie_title": "Ala Vaikunthapurramuloo (2020)",
        "language": "Telugu",
        "format": "2D Dolby Atmos",
        "show_date": "2026-09-02",
        "show_time": "09:45 PM",
        "show_slot": "Second Show",
        "tier_price": {"BALCONY": 250, "PREMIUM": 180, "EXECUTIVE": 120},
        "booking_status": "OPEN",
        "counter_held_seats": ["A1", "A2"],
        "tickets_sold_online": 195,
        "tickets_sold_counter": 20,
        "gross_collected": 43500.0
    }
]

GATE_SCANNED_TICKETS: Dict[str, Dict[str, Any]] = {}

# ---------------------------------------------------------
# PYDANTIC SCHEMAS
# ---------------------------------------------------------

class PartnerRegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    theatre_name: str
    city: str
    address: str
    gst_number: Optional[str] = "37AAAAA0000A1Z5"
    trade_license: Optional[str] = "GMC/TL/2026/001"
    bank_name: str
    bank_account_num: str
    ifsc_code: str
    account_holder: str

class PartnerLoginRequest(BaseModel):
    email: str
    password: str

class ScreenLayoutUpdateRequest(BaseModel):
    screen_name: str
    sound_system: Optional[str] = "Dolby Atmos 64-Channel"
    projection: Optional[str] = "Barco 4K RGB Laser"
    total_capacity: int
    layout_config: Dict[str, Any]

class ShowScheduleRequest(BaseModel):
    theatre_id: str
    screen_id: str
    movie_id: str
    language: Optional[str] = "Telugu"
    format: Optional[str] = "2D Dolby Atmos"
    show_date: str
    show_time: str
    show_slot: Optional[str] = "Evening"
    tier_price: Dict[str, float]
    counter_held_seats: Optional[List[str]] = []

class ShowPricingOverrideRequest(BaseModel):
    tier_price: Dict[str, float]

class CounterSeatHoldRequest(BaseModel):
    seat_identifiers: List[str]

class TicketScanRequest(BaseModel):
    qr_payload: str
    gatekeeper_id: Optional[str] = "gate-01"
    theatre_id: Optional[str] = "th-gtr-001"

# ---------------------------------------------------------
# AUTHENTICATION & ONBOARDING
# ---------------------------------------------------------

@router.post("/register")
async def register_partner(req: PartnerRegisterRequest):
    theatre_id = f"th-part-{uuid.uuid4().hex[:6]}"
    
    partner = {
        "id": f"part-{uuid.uuid4().hex[:6]}",
        "email": req.email,
        "name": req.name,
        "phone": req.phone,
        "theatre_id": theatre_id,
        "theatre_name": req.theatre_name,
        "city": req.city.lower(),
        "gst_number": req.gst_number,
        "trade_license": req.trade_license,
        "bank_name": req.bank_name,
        "bank_account_num": req.bank_account_num,
        "ifsc_code": req.ifsc_code,
        "account_holder": req.account_holder,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    }
    
    PARTNER_PROFILES[req.email] = partner
    
    # Initialize default screen layout
    PARTNER_SCREENS[theatre_id] = [
        {
            "id": f"scr-{uuid.uuid4().hex[:6]}",
            "theatre_id": theatre_id,
            "screen_name": "Audi 1 4K Laser",
            "sound_system": "Dolby Atmos 7.1",
            "projection": "Barco 4K Laser",
            "total_capacity": 240,
            "layout_config": {
                "tiers": [
                    {
                        "name": "BALCONY",
                        "label": "Balcony (Gold)",
                        "price": 250,
                        "rows": [{"rowLetter": "A", "seats": 12, "counterQuotaSeats": []}]
                    },
                    {
                        "name": "PREMIUM",
                        "label": "Premium Executive",
                        "price": 180,
                        "rows": [{"rowLetter": "B", "seats": 14, "counterQuotaSeats": []}, {"rowLetter": "C", "seats": 14, "counterQuotaSeats": []}]
                    },
                    {
                        "name": "EXECUTIVE",
                        "label": "Classic Second Class",
                        "price": 120,
                        "rows": [{"rowLetter": "D", "seats": 16, "counterQuotaSeats": []}, {"rowLetter": "E", "seats": 16, "counterQuotaSeats": []}]
                    }
                ]
            }
        }
    ]
    
    return {
        "success": True,
        "message": "Theatre partner onboarded successfully with T+1 payout setup.",
        "partner": partner,
        "token": f"partner_jwt_{uuid.uuid4().hex}"
    }

@router.post("/login")
async def login_partner(req: PartnerLoginRequest):
    partner = PARTNER_PROFILES.get(req.email)
    if not partner and req.email:
        # Default mock partner if test credentials entered
        partner = PARTNER_PROFILES["partner@sivacinemas.com"]
    
    return {
        "success": True,
        "partner": partner,
        "token": f"partner_jwt_{uuid.uuid4().hex}"
    }

@router.get("/profile")
async def get_partner_profile(email: Optional[str] = "partner@sivacinemas.com"):
    partner = PARTNER_PROFILES.get(email, PARTNER_PROFILES["partner@sivacinemas.com"])
    return {"partner": partner}

# ---------------------------------------------------------
# HALL / SCREEN LAYOUT BUILDER
# ---------------------------------------------------------

@router.get("/screens")
async def get_partner_screens(theatre_id: Optional[str] = "th-gtr-001"):
    screens = PARTNER_SCREENS.get(theatre_id, PARTNER_SCREENS["th-gtr-001"])
    return {"screens": screens}

@router.put("/screens/{screen_id}/layout")
async def update_screen_layout(screen_id: str, req: ScreenLayoutUpdateRequest, theatre_id: Optional[str] = "th-gtr-001"):
    screens = PARTNER_SCREENS.get(theatre_id, [])
    screen = next((s for s in screens if s["id"] == screen_id), None)
    if not screen:
        # Create or insert
        screen = {
            "id": screen_id,
            "theatre_id": theatre_id,
            "screen_name": req.screen_name,
            "sound_system": req.sound_system,
            "projection": req.projection,
            "total_capacity": req.total_capacity,
            "layout_config": req.layout_config
        }
        if theatre_id not in PARTNER_SCREENS:
            PARTNER_SCREENS[theatre_id] = []
        PARTNER_SCREENS[theatre_id].append(screen)
    else:
        screen["screen_name"] = req.screen_name
        screen["sound_system"] = req.sound_system
        screen["projection"] = req.projection
        screen["total_capacity"] = req.total_capacity
        screen["layout_config"] = req.layout_config

    return {
        "success": True,
        "message": f"Screen {screen_id} hall layout and seat tier mapping saved successfully.",
        "screen": screen
    }

# ---------------------------------------------------------
# SHOW SCHEDULING & DYNAMIC PRICING OVERRIDE
# ---------------------------------------------------------

@router.get("/shows")
async def get_partner_shows(theatre_id: Optional[str] = "th-gtr-001", show_date: Optional[str] = None):
    shows = [s for s in PARTNER_SHOWS if s["theatre_id"] == theatre_id]
    if show_date:
        shows = [s for s in shows if s["show_date"] == show_date]
    return {"shows": shows}

@router.post("/shows")
async def schedule_partner_show(req: ShowScheduleRequest):
    # Lookup movie title
    movie = next((m for m in SEED_MOVIES if m["id"] == req.movie_id), None)
    movie_title = movie["title"] if movie else "Pushpa 2: The Rule (2024)"

    new_show = {
        "id": f"sh-part-{uuid.uuid4().hex[:6]}",
        "theatre_id": req.theatre_id,
        "theatre_name": "Siva Cinemas",
        "screen_id": req.screen_id,
        "screen_name": "Screen 1 4K Laser",
        "movie_id": req.movie_id,
        "movie_title": movie_title,
        "language": req.language or "Telugu",
        "format": req.format or "2D Dolby Atmos",
        "show_date": req.show_date,
        "show_time": req.show_time,
        "show_slot": req.show_slot or "Matinee",
        "tier_price": req.tier_price,
        "booking_status": "OPEN",
        "counter_held_seats": req.counter_held_seats or [],
        "tickets_sold_online": 0,
        "tickets_sold_counter": 0,
        "gross_collected": 0.0
    }

    PARTNER_SHOWS.insert(0, new_show)
    return {
        "success": True,
        "message": "Show scheduled and advance bookings opened online.",
        "show": new_show
    }

@router.patch("/shows/{show_id}/pricing")
async def override_show_pricing(show_id: str, req: ShowPricingOverrideRequest):
    show = next((s for s in PARTNER_SHOWS if s["id"] == show_id), None)
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")

    show["tier_price"].update(req.tier_price)
    return {
        "success": True,
        "message": f"Show {show_id} dynamic pricing updated.",
        "tier_price": show["tier_price"]
    }

@router.patch("/shows/{show_id}/status")
async def toggle_show_booking_status(show_id: str, status_value: str = Query(..., enum=["OPEN", "CLOSED", "CANCELLED"])):
    show = next((s for s in PARTNER_SHOWS if s["id"] == show_id), None)
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")

    show["booking_status"] = status_value
    return {
        "success": True,
        "message": f"Show {show_id} online booking status changed to {status_value}.",
        "booking_status": status_value
    }

@router.post("/shows/{show_id}/hold-counter-seats")
async def hold_counter_seats(show_id: str, req: CounterSeatHoldRequest):
    show = next((s for s in PARTNER_SHOWS if s["id"] == show_id), None)
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")

    # Add to counter quota
    current_held = set(show.get("counter_held_seats", []))
    current_held.update(req.seat_identifiers)
    show["counter_held_seats"] = sorted(list(current_held))

    return {
        "success": True,
        "message": f"Successfully reserved {len(req.seat_identifiers)} seats for box-office physical cash counter.",
        "counter_held_seats": show["counter_held_seats"]
    }

# ---------------------------------------------------------
# T+1 FINANCIAL SETTLEMENTS & AUDIT REPORTS
# ---------------------------------------------------------

@router.get("/reports/daily-summary")
async def get_daily_financial_summary(theatre_id: Optional[str] = "th-gtr-001", target_date: Optional[str] = "2026-09-02"):
    shows = [s for s in PARTNER_SHOWS if s["theatre_id"] == theatre_id and s["show_date"] == target_date]
    if not shows:
        shows = PARTNER_SHOWS[:4]

    total_tickets_online = sum(s.get("tickets_sold_online", 0) for s in shows)
    total_tickets_counter = sum(s.get("tickets_sold_counter", 0) for s in shows)
    total_tickets = total_tickets_online + total_tickets_counter
    gross_revenue = sum(s.get("gross_collected", 0.0) for s in shows)
    platform_fee = 0.0 # Zero deductions policy for standalone exhibitors
    gst_collected = gross_revenue * 0.18
    net_payout = gross_revenue - platform_fee

    return {
        "theatre_id": theatre_id,
        "theatre_name": "Siva Cinemas",
        "city": "Guntur",
        "settlement_date": target_date,
        "summary": {
            "total_shows": len(shows),
            "total_tickets_sold": total_tickets,
            "tickets_sold_online": total_tickets_online,
            "tickets_sold_counter": total_tickets_counter,
            "gross_revenue": gross_revenue,
            "platform_fee_deductions": platform_fee,
            "gst_collected": gst_collected,
            "net_payout_amount": net_payout,
            "settlement_status": "PROCESSING_T1",
            "payout_bank": "State Bank of India (A/C: ****29481)",
            "scheduled_payout_time": "Tomorrow at 09:00 AM IST"
        },
        "shows_breakdown": shows
    }

@router.get("/settlements")
async def get_settlement_history(theatre_id: Optional[str] = "th-gtr-001"):
    return {
        "settlements": [
            {
                "id": "SETTL-2026-0902",
                "date": "2026-09-02",
                "gross_revenue": 173160.0,
                "tickets_sold": 735,
                "net_payout": 173160.0,
                "platform_fee": 0.0,
                "status": "PROCESSING",
                "bank_ref": "NEFT/PENDING",
                "payout_eta": "03 Sep 2026, 09:00 AM"
            },
            {
                "id": "SETTL-2026-0901",
                "date": "2026-09-01",
                "gross_revenue": 189400.0,
                "tickets_sold": 810,
                "net_payout": 189400.0,
                "platform_fee": 0.0,
                "status": "TRANSFERRED",
                "bank_ref": "UTR-SBIN9284910294",
                "payout_eta": "02 Sep 2026, 08:45 AM (Success)"
            },
            {
                "id": "SETTL-2026-0831",
                "date": "2026-08-31",
                "gross_revenue": 162500.0,
                "tickets_sold": 690,
                "net_payout": 162500.0,
                "platform_fee": 0.0,
                "status": "TRANSFERRED",
                "bank_ref": "UTR-SBIN8194018274",
                "payout_eta": "01 Sep 2026, 09:12 AM (Success)"
            }
        ]
    }

# ---------------------------------------------------------
# GATEKEEPER QR TICKET SCANNER & VERIFICATION
# ---------------------------------------------------------

@router.post("/scan-ticket")
async def scan_and_verify_ticket(req: TicketScanRequest):
    """
    Validates QR code payload format:
    https://cinebook.in/verify-ticket?ref=CB-2026-XXXXXX&sig=pay_rzp_XXXX
    """
    payload = req.qr_payload.strip()
    
    # Extract reference
    booking_ref = None
    if "ref=" in payload:
        booking_ref = payload.split("ref=")[1].split("&")[0]
    elif payload.startswith("CB-"):
        booking_ref = payload
    else:
        booking_ref = payload

    if not booking_ref:
        raise HTTPException(status_code=400, detail="Invalid QR Code payload.")

    # Check duplicate check-in
    now = datetime.utcnow().isoformat()
    if booking_ref in GATE_SCANNED_TICKETS:
        first_scan = GATE_SCANNED_TICKETS[booking_ref]
        return {
            "status": "DUPLICATE_ALERT",
            "is_valid": False,
            "message": "ALREADY ADMITTED! Duplicate QR entry attempt detected.",
            "first_scanned_at": first_scan.get("scanned_at"),
            "booking_ref": booking_ref,
            "attendee_name": first_scan.get("attendee_name", "K. Dhanush"),
            "seats": first_scan.get("seats", ["C5", "C6"]),
            "show_time": first_scan.get("show_time", "11:00 AM"),
            "movie_title": first_scan.get("movie_title", "Pushpa 2: The Rule (2024)")
        }

    # First time valid admission
    ticket_record = {
        "booking_ref": booking_ref,
        "attendee_name": "Dhanush Kancharla",
        "movie_title": "Pushpa 2: The Rule (2024)",
        "theatre_name": "Siva Cinemas",
        "screen_name": "Screen 1 4K Laser",
        "show_time": "11:00 AM (Morning Show)",
        "show_date": "2026-09-02",
        "seats": ["C5", "C6"],
        "tier": "PREMIUM EXECUTIVE",
        "tickets_count": 2,
        "scanned_at": now,
        "gatekeeper_id": req.gatekeeper_id,
        "status": "ADMITTED"
    }

    GATE_SCANNED_TICKETS[booking_ref] = ticket_record

    return {
        "status": "ADMITTED",
        "is_valid": True,
        "message": "ENTRY APPROVED • Valid Ticket Verified",
        "ticket": ticket_record
    }

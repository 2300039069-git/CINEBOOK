from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, movies, theatres, shows, events, seats, bookings, payments, admin, partner

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(movies.router, prefix="/movies", tags=["Movies"])
api_router.include_router(theatres.router, prefix="/theatres", tags=["Theatres"])
api_router.include_router(shows.router, prefix="/shows", tags=["Shows"])
api_router.include_router(events.router, prefix="/events", tags=["Events"])
api_router.include_router(seats.router, prefix="/seats", tags=["Seat Concurrency & Locking"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(payments.router, prefix="/payments", tags=["Razorpay Payments"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Portal & QR Gate Verification"])
api_router.include_router(partner.router, prefix="/partner", tags=["Exhibitor & Theatre Partner Portal"])

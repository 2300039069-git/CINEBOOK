import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("cinebook.database")

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None
    is_connected: bool = False

db_manager = Database()

async def connect_to_mongo():
    """Establish async connection to MongoDB Atlas / Local MongoDB"""
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI.split('@')[-1] if '@' in settings.MONGODB_URI else 'configured URI'}...")
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=3000,
            maxPoolSize=50,
            minPoolSize=10
        )
        db_manager.db = db_manager.client[settings.DATABASE_NAME]
        
        # Ping MongoDB to verify live connectivity
        await db_manager.client.admin.command('ping')
        db_manager.is_connected = True
        logger.info("Successfully connected to MongoDB Atlas!")
        
        # Create database indexes
        await init_db_indexes()
    except Exception as e:
        db_manager.is_connected = False
        logger.warning(f"MongoDB connection ping failed: {str(e)}. Running in hybrid/mock fallback mode.")

async def close_mongo_connection():
    """Close MongoDB connection gracefully"""
    if db_manager.client:
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

async def init_db_indexes():
    """Create essential performance, unique, and TTL indexes"""
    if not db_manager.is_connected:
        return
    
    try:
        db = db_manager.db
        
        # 1. Users collection
        await db.users.create_index("email", unique=True)
        await db.users.create_index("role")
        
        # 2. Theatres collection
        await db.theatres.create_index([("city", 1), ("is_active", 1)])
        await db.theatres.create_index([("name", "text"), ("city", "text")])
        
        # 3. Screens collection
        await db.screens.create_index("theatre_id")
        
        # 4. Movies collection
        await db.movies.create_index([("status", 1), ("release_date", -1)])
        await db.movies.create_index("genres")
        await db.movies.create_index("languages")
        await db.movies.create_index([("title", "text")])
        await db.movies.create_index("slug", unique=True)
        
        # 5. Shows collection
        await db.shows.create_index([("movie_id", 1), ("show_date", 1), ("is_active", 1)])
        await db.shows.create_index([("theatre_id", 1), ("show_date", 1)])
        
        # 6. Seat Locks collection (CRITICAL FOR CONCURRENCY)
        # Compound unique index prevents race condition double-locking
        await db.seat_locks.create_index(
            [("show_id", 1), ("seat_id", 1)],
            unique=True
        )
        # TTL Index: Automatically purges locks that expire after 5 minutes
        await db.seat_locks.create_index(
            "expires_at",
            expireAfterSeconds=0
        )
        
        # 7. Bookings collection
        await db.bookings.create_index("booking_id", unique=True)
        await db.bookings.create_index([("user_id", 1), ("created_at", -1)])
        
        # 8. Payments collection
        await db.payments.create_index("razorpay_order_id", unique=True)
        await db.payments.create_index("booking_id")
        
        logger.info("MongoDB indexes verified & created successfully.")
    except Exception as e:
        logger.error(f"Error creating MongoDB indexes: {e}")

def get_database() -> AsyncIOMotorDatabase:
    """Dependency injector for routes requiring database"""
    return db_manager.db

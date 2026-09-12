import logging
import json
from typing import List, Dict, Any, Optional
import asyncpg
from app.core.config import settings
from app.core.seed_data import SEED_MOVIES, SEED_THEATRES, SEED_SHOWS, SEED_EVENTS

logger = logging.getLogger("cinebook.database")

async def _init_connection(conn: asyncpg.Connection):
    """Register JSON/JSONB codecs so dictionaries and lists serialize automatically"""
    await conn.set_type_codec(
        'jsonb',
        encoder=json.dumps,
        decoder=json.loads,
        schema='pg_catalog'
    )
    await conn.set_type_codec(
        'json',
        encoder=json.dumps,
        decoder=json.loads,
        schema='pg_catalog'
    )

class Database:
    pool: Optional[asyncpg.Pool] = None
    is_connected: bool = False

    async def ensure_connected(self):
        if not self.pool or getattr(self.pool, '_closed', False):
            await connect_to_supabase()

    async def fetch_all(self, query: str, *args) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results as a list of dicts"""
        await self.ensure_connected()
        if not self.pool:
            return []
        async with self.pool.acquire() as conn:
            records = await conn.fetch(query, *args)
            return [dict(r) for r in records]

    async def fetch_one(self, query: str, *args) -> Optional[Dict[str, Any]]:
        """Execute a SELECT query and return a single dict or None"""
        await self.ensure_connected()
        if not self.pool:
            return None
        async with self.pool.acquire() as conn:
            record = await conn.fetchrow(query, *args)
            return dict(record) if record else None

    async def fetchval(self, query: str, *args) -> Any:
        """Execute a query and return a single scalar value"""
        await self.ensure_connected()
        if not self.pool:
            return None
        async with self.pool.acquire() as conn:
            return await conn.fetchval(query, *args)

    async def execute(self, query: str, *args) -> str:
        """Execute an INSERT, UPDATE, DELETE, or DDL command"""
        await self.ensure_connected()
        if not self.pool:
            return ""
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)

db_manager = Database()

_schema_initialized = False

async def connect_to_supabase():
    """Establish async connection pool to Supabase PostgreSQL"""
    global _schema_initialized
    try:
        masked_url = settings.SUPABASE_DB_URL.split('@')[-1] if '@' in settings.SUPABASE_DB_URL else 'Supabase'
        logger.info(f"Connecting to Supabase PostgreSQL at {masked_url}...")
        
        db_manager.pool = await asyncpg.create_pool(
            dsn=settings.SUPABASE_DB_URL,
            min_size=1,
            max_size=10,
            init=_init_connection,
            statement_cache_size=0, # Required for Supabase PgBouncer / pooler
            timeout=15
        )
        
        # Verify connectivity
        async with db_manager.pool.acquire() as conn:
            pg_version = await conn.fetchval("SELECT version();")
            logger.info(f"Successfully connected to Supabase PostgreSQL! ({pg_version.split(',')[0]})")
        
        db_manager.is_connected = True
        
        # Create database tables and indexes only on initial process bootstrap
        if not _schema_initialized:
            await init_supabase_schema()
            await seed_supabase_data_if_empty()
            _schema_initialized = True
        
    except Exception as e:
        db_manager.is_connected = False
        logger.warning(f"Supabase connection failed: {str(e)}. Running in fallback mode.")

async def close_supabase_connection():
    """Close Supabase connection pool gracefully"""
    if db_manager.pool:
        await db_manager.pool.close()
        db_manager.is_connected = False
        logger.info("Supabase PostgreSQL connection pool closed.")

async def init_supabase_schema():
    """Create essential tables, indexes, and concurrency constraints in Supabase"""
    if not db_manager.is_connected or not db_manager.pool:
        return
    
    try:
        async with db_manager.pool.acquire() as conn:
            # 1. Users table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT,
                    phone TEXT,
                    role TEXT NOT NULL DEFAULT 'CUSTOMER',
                    avatar TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    theatre_ids JSONB DEFAULT '[]'::jsonb,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS theatre_ids JSONB DEFAULT '[]'::jsonb;
                CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
                CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
            """)

            # 2. Theatres table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS theatres (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    slug TEXT,
                    city TEXT NOT NULL,
                    address TEXT,
                    phone TEXT,
                    email TEXT,
                    facilities JSONB DEFAULT '[]'::jsonb,
                    distance TEXT,
                    cancellation_policy TEXT DEFAULT 'Refundable up to 2 hours before showtime',
                    screens JSONB DEFAULT '[]'::jsonb,
                    rating NUMERIC(3,1) DEFAULT 4.5,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                ALTER TABLE theatres ADD COLUMN IF NOT EXISTS slug TEXT;
                ALTER TABLE theatres ADD COLUMN IF NOT EXISTS phone TEXT;
                ALTER TABLE theatres ADD COLUMN IF NOT EXISTS email TEXT;
                ALTER TABLE theatres ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
                ALTER TABLE theatres ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 4.5;
                CREATE INDEX IF NOT EXISTS idx_theatres_city ON theatres(city);
            """)

            # 3. Movies table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS movies (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    slug TEXT,
                    tagline TEXT,
                    description TEXT,
                    genres JSONB DEFAULT '[]'::jsonb,
                    languages JSONB DEFAULT '[]'::jsonb,
                    formats JSONB DEFAULT '["2D", "3D"]'::jsonb,
                    duration TEXT,
                    duration_minutes INT DEFAULT 150,
                    release_date TEXT,
                    rating NUMERIC(3,1) DEFAULT 0.0,
                    votes TEXT DEFAULT '0',
                    censor_rating TEXT DEFAULT 'UA',
                    poster_url TEXT,
                    backdrop_url TEXT,
                    trailer_url TEXT,
                    director TEXT,
                    cast_members JSONB DEFAULT '[]'::jsonb,
                    status TEXT DEFAULT 'NOW_SHOWING',
                    is_featured BOOLEAN DEFAULT FALSE,
                    cities JSONB DEFAULT '["mumbai", "delhi", "bengaluru"]'::jsonb,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                ALTER TABLE movies ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 150;
                ALTER TABLE movies ADD COLUMN IF NOT EXISTS cities JSONB DEFAULT '["guntur", "vijayawada", "tenali"]'::jsonb;
                ALTER TABLE movies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'NOW_SHOWING';
                ALTER TABLE movies ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
                CREATE INDEX IF NOT EXISTS idx_movies_status ON movies(status);
            """)

            # 4. Shows table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS shows (
                    id TEXT PRIMARY KEY,
                    movie_id TEXT NOT NULL,
                    theatre_id TEXT NOT NULL,
                    theatre_name TEXT,
                    screen_id TEXT,
                    screen_name TEXT,
                    format TEXT DEFAULT '2D',
                    language TEXT DEFAULT 'Telugu',
                    show_date TEXT NOT NULL,
                    show_time TEXT NOT NULL,
                    tier_price JSONB,
                    convenience_fee_per_ticket NUMERIC(10,2) DEFAULT 25.0,
                    tax_percentage NUMERIC(5,2) DEFAULT 18.0,
                    availability TEXT DEFAULT 'AVAILABLE',
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                ALTER TABLE shows ALTER COLUMN screen_id DROP NOT NULL;
                ALTER TABLE shows ADD COLUMN IF NOT EXISTS theatre_name TEXT;
                ALTER TABLE shows ADD COLUMN IF NOT EXISTS screen_id TEXT;
                ALTER TABLE shows ADD COLUMN IF NOT EXISTS screen_name TEXT;
                ALTER TABLE shows ADD COLUMN IF NOT EXISTS tier_price JSONB;
                ALTER TABLE shows ADD COLUMN IF NOT EXISTS convenience_fee_per_ticket NUMERIC(10,2) DEFAULT 25.0;
                ALTER TABLE shows ADD COLUMN IF NOT EXISTS tax_percentage NUMERIC(5,2) DEFAULT 18.0;
                ALTER TABLE shows ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
                CREATE INDEX IF NOT EXISTS idx_shows_movie_date ON shows(movie_id, show_date);
                CREATE INDEX IF NOT EXISTS idx_shows_theatre_date ON shows(theatre_id, show_date);
            """)

            # 5. Seat Locks table (CRITICAL: UNIQUE constraint on show_id + seat_id prevents double booking)
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS seat_locks (
                    id SERIAL PRIMARY KEY,
                    show_id TEXT NOT NULL,
                    seat_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    lock_token TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'LOCKED',
                    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
                    locked_at TIMESTAMPTZ DEFAULT NOW(),
                    expires_at TIMESTAMPTZ NOT NULL
                );
                ALTER TABLE seat_locks ADD COLUMN IF NOT EXISTS is_booked BOOLEAN DEFAULT FALSE;
                CREATE UNIQUE INDEX IF NOT EXISTS uq_seat_locks_show_seat_idx ON seat_locks(show_id, seat_id);
                CREATE INDEX IF NOT EXISTS idx_seat_locks_expires ON seat_locks(expires_at);
            """)

            # 6. Booked Seats table (Database-level permanent booking constraint)
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS booked_seats (
                    id SERIAL PRIMARY KEY,
                    show_id TEXT NOT NULL,
                    seat_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    booking_id TEXT NOT NULL,
                    booked_at TIMESTAMPTZ DEFAULT NOW()
                );
                CREATE UNIQUE INDEX IF NOT EXISTS uq_booked_seats_show_seat_idx ON booked_seats(show_id, seat_id);
                CREATE INDEX IF NOT EXISTS idx_booked_seats_show ON booked_seats(show_id);
            """)

            # 7. Bookings table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS bookings (
                    booking_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    show_id TEXT NOT NULL,
                    movie_id TEXT NOT NULL,
                    theatre_id TEXT NOT NULL,
                    show_date TEXT NOT NULL,
                    show_time TEXT NOT NULL,
                    lock_token TEXT,
                    seats JSONB NOT NULL,
                    base_amount NUMERIC(10,2) NOT NULL,
                    convenience_fee NUMERIC(10,2) NOT NULL,
                    taxes NUMERIC(10,2) NOT NULL,
                    total_amount NUMERIC(10,2) NOT NULL,
                    customer_name TEXT,
                    customer_email TEXT,
                    customer_phone TEXT,
                    booking_status TEXT NOT NULL DEFAULT 'PENDING',
                    payment_id TEXT,
                    ticket_qr_payload TEXT,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                ALTER TABLE bookings ADD COLUMN IF NOT EXISTS lock_token TEXT;
                CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_bookings_show ON bookings(show_id, booking_status);
            """)

            # 8. OTPs table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS otps (
                    id SERIAL PRIMARY KEY,
                    email TEXT NOT NULL,
                    purpose TEXT NOT NULL,
                    otp TEXT NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    expires_at TIMESTAMPTZ NOT NULL
                );
                CREATE UNIQUE INDEX IF NOT EXISTS uq_otps_email_purpose_idx ON otps(email, purpose);
            """)

            # 9. Events table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS events (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    category TEXT NOT NULL,
                    city TEXT NOT NULL,
                    venue TEXT,
                    date TEXT,
                    time TEXT,
                    banner_url TEXT,
                    price_starting NUMERIC(10,2),
                    description TEXT,
                    is_featured BOOLEAN DEFAULT FALSE,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
            """)

            # 10. Payments table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS payments (
                    id SERIAL PRIMARY KEY,
                    razorpay_order_id TEXT UNIQUE,
                    payment_id TEXT,
                    booking_id TEXT NOT NULL,
                    amount NUMERIC(10,2) NOT NULL,
                    currency TEXT DEFAULT 'INR',
                    status TEXT NOT NULL DEFAULT 'CREATED',
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
            """)

        logger.info("Supabase PostgreSQL tables and indexes verified successfully.")
    except Exception as e:
        logger.error(f"Error initializing Supabase schema: {e}")

async def seed_supabase_data_if_empty():
    """Populate default cinema movies, theatres, shows, and demo users if Supabase tables are empty"""
    if not db_manager.is_connected or not db_manager.pool:
        return
    
    try:
        async with db_manager.pool.acquire() as conn:
            movie_count = await conn.fetchval("SELECT COUNT(*) FROM movies;")
            if movie_count == 0:
                logger.info("Seeding default movies into Supabase...")
                for m in SEED_MOVIES:
                    await conn.execute("""
                        INSERT INTO movies (
                            id, title, slug, tagline, description, genres, languages,
                            formats, duration, duration_minutes, release_date, rating,
                            votes, censor_rating, poster_url, backdrop_url, trailer_url,
                            director, cast_members, status, is_featured, cities
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7,
                            $8, $9, $10, $11, $12,
                            $13, $14, $15, $16, $17,
                            $18, $19, $20, $21, $22
                        ) ON CONFLICT (id) DO UPDATE SET
                            title = EXCLUDED.title,
                            slug = EXCLUDED.slug,
                            genres = EXCLUDED.genres,
                            languages = EXCLUDED.languages,
                            formats = EXCLUDED.formats,
                            poster_url = EXCLUDED.poster_url,
                            backdrop_url = EXCLUDED.backdrop_url,
                            cities = EXCLUDED.cities;
                    """,
                    m["id"], m["title"], m["slug"], m.get("tagline"), m["description"],
                    m.get("genres", []), m.get("languages", []), m.get("formats", ["2D", "3D"]),
                    m["duration"], m["duration_minutes"], m["release_date"], m["rating"],
                    m["votes"], m["censor_rating"], m["poster_url"], m["backdrop_url"],
                    m.get("trailer_url"), m["director"], m.get("cast", []), m["status"],
                    m.get("is_featured", False), m.get("cities", ["guntur", "vijayawada", "tenali"])
                    )

            theatre_count = await conn.fetchval("SELECT COUNT(*) FROM theatres;")
            if theatre_count == 0:
                logger.info("Seeding default theatres into Supabase...")
                for t in SEED_THEATRES:
                    await conn.execute("""
                        INSERT INTO theatres (
                            id, name, slug, city, address, phone, email,
                            facilities, distance, cancellation_policy, screens,
                            rating, is_active
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7,
                            $8, $9, $10, $11,
                            $12, $13
                        ) ON CONFLICT (id) DO UPDATE SET
                            name = EXCLUDED.name,
                            slug = EXCLUDED.slug,
                            city = EXCLUDED.city,
                            address = EXCLUDED.address,
                            screens = EXCLUDED.screens;
                    """,
                    t["id"], t["name"], t["slug"], t["city"], t["address"], t.get("phone"),
                    t.get("email"), t.get("facilities", []), t.get("distance"),
                    t.get("cancellation_policy", "Refundable"), t.get("screens", []),
                    4.5, t.get("is_active", True)
                    )

            shows_count = await conn.fetchval("SELECT COUNT(*) FROM shows;")
            if shows_count == 0:
                logger.info("Seeding default shows into Supabase...")
                for s in SEED_SHOWS:
                    await conn.execute("""
                        INSERT INTO shows (
                            id, movie_id, theatre_id, screen_id, theatre_name, screen_name,
                            format, language, show_date, show_time, tier_price,
                            convenience_fee_per_ticket, tax_percentage, availability, is_active
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6,
                            $7, $8, $9, $10, $11,
                            $12, $13, $14, $15
                        ) ON CONFLICT (id) DO UPDATE SET
                            theatre_name = EXCLUDED.theatre_name,
                            screen_name = EXCLUDED.screen_name,
                            tier_price = EXCLUDED.tier_price,
                            availability = EXCLUDED.availability;
                    """,
                    s["id"], s["movie_id"], s["theatre_id"], s.get("screen_id", "scr-01"), s.get("theatre_name", "CineBook Screen"),
                    s.get("screen_name", "Screen 1"), s.get("format", "2D"), s.get("language", "Telugu"),
                    s["show_date"], s["show_time"], s.get("tier_price", {"CLASSIC": 250.0, "PREMIUM": 380.0, "RECLINER": 550.0}),
                    s.get("convenience_fee_per_ticket", 25.0), s.get("tax_percentage", 18.0),
                    s.get("availability", "AVAILABLE"), s.get("is_active", True)
                    )

            events_count = await conn.fetchval("SELECT COUNT(*) FROM events;")
            if events_count == 0:
                logger.info("Seeding default events into Supabase...")
                for e in SEED_EVENTS:
                    await conn.execute("""
                        INSERT INTO events (
                            id, title, category, city, venue, date, time,
                            banner_url, price_starting, description, is_featured, is_active
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7,
                            $8, $9, $10, $11, $12
                        ) ON CONFLICT (id) DO NOTHING;
                    """,
                    e["id"], e["title"], e["category"], e["city"], e.get("venue", "City Arena"),
                    e["date"], e["time"], e["banner_url"], e["price_starting"],
                    e["description"], e.get("is_featured", False), e.get("is_active", True)
                    )
    except Exception as e:
        logger.warning(f"Error seeding data into Supabase: {e}")


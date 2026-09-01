import os
import sys
import json
import psycopg2
import bcrypt
import urllib.parse
from datetime import datetime, timezone

# Add parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.seed_data import SEED_MOVIES, SEED_THEATRES, SEED_SHOWS

password = urllib.parse.quote_plus('KancharlaDhanush@2003')
SUPABASE_URI = f'postgresql://postgres.jyptmaprxztaxjoapbjs:{password}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'

def seed_supabase():
    print(f"Connecting to Supabase PostgreSQL at aws-0-ap-south-1.pooler.supabase.com:6543...")
    conn = psycopg2.connect(SUPABASE_URI)
    cur = conn.cursor()

    # 1. Clean existing records
    print("\n1. Clearing existing records in public schema...")
    cur.execute("DELETE FROM seat_locks;")
    cur.execute("DELETE FROM bookings;")
    cur.execute("DELETE FROM shows;")
    cur.execute("DELETE FROM theatres;")
    cur.execute("DELETE FROM movies;")
    cur.execute("DELETE FROM users;")

    # 2. Seed Movies
    print("\n2. Seeding Movies Table...")
    for m in SEED_MOVIES:
        cur.execute("""
            INSERT INTO movies (
                id, title, slug, tagline, description, poster_url, backdrop_url,
                trailer_url, duration, censor_rating, release_date, rating, votes,
                director, genres, languages, formats, is_featured, status, cast_members
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """, (
            m["id"], m["title"], m["slug"], m.get("tagline", ""), m["description"],
            m.get("poster_url") or m.get("posterUrl"),
            m.get("backdrop_url") or m.get("backdropUrl"),
            m.get("trailer_url") or m.get("trailerUrl", ""),
            m["duration"],
            m.get("censor_rating") or m.get("censorRating", "UA"),
            m.get("release_date") or m.get("releaseDate", "2026-03-01"),
            m.get("rating", 8.5), m.get("votes", "50K"), m.get("director", "Christopher Nolan"),
            m["genres"], m["languages"], m["formats"], m.get("is_featured", False),
            m.get("status", "NOW_SHOWING"), json.dumps(m.get("cast", []))
        ))
    print(f"   Inserted {len(SEED_MOVIES)} movies.")

    # 3. Seed Theatres
    print("\n3. Seeding Theatres Table...")
    for t in SEED_THEATRES:
        cur.execute("""
            INSERT INTO theatres (
                id, name, city, address, distance, facilities, cancellation_policy, screens
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """, (
            t["id"], t["name"], t["city"], t["address"], t.get("distance", "2.5 km"),
            t.get("facilities", []), t.get("cancellation_policy", "Cancellation Available"),
            json.dumps(t.get("screens", []))
        ))
    print(f"   Inserted {len(SEED_THEATRES)} theatres.")

    # 4. Seed Shows
    print("\n4. Seeding Shows Table...")
    for s in SEED_SHOWS:
        cur.execute("""
            INSERT INTO shows (
                id, movie_id, theatre_id, screen_id, show_date, show_time, format, language, price, availability
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """, (
            s["id"], s["movie_id"], s["theatre_id"], s.get("screen_id", "scr-01"),
            s["show_date"], s["show_time"], s["format"], s["language"],
            json.dumps(s.get("tier_price", {"CLASSIC": 150, "PREMIUM": 250, "RECLINER": 350})),
            s.get("availability", "AVAILABLE")
        ))
    print(f"   Inserted {len(SEED_SHOWS)} shows.")

    # 5. Seed Users & Super Admin
    print("\n5. Seeding Users (including Super Admin Dhanush Kancharla)...")
    super_admin_pass = 'AdminPass@2026'
    super_admin_hash = bcrypt.hashpw(super_admin_pass.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cust_hash = bcrypt.hashpw('CustomerPass@2026'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    users_data = [
        (
            'usr-admin-dhanush', 'Dhanush Kancharla (Super Admin)', 'kancharladhanush2003@gmail.com',
            '+91 98765 00001', super_admin_hash, 'SUPER_ADMIN',
            'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
            True
        ),
        (
            'usr-001', 'Aarav Sharma', 'aarav.sharma@example.com',
            '+91 98765 43210', cust_hash, 'CUSTOMER',
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
            True
        )
    ]

    for u in users_data:
        cur.execute("""
            INSERT INTO users (id, name, email, phone, password_hash, role, avatar, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                password_hash = EXCLUDED.password_hash,
                role = EXCLUDED.role;
        """, u)
    print(f"   Inserted users with Super Admin access for kancharladhanush2003@gmail.com.")

    conn.commit()
    conn.close()
    print("\n>>> SUPABASE DATABASE POPULATED SUCCESSFULLY! <<<")

if __name__ == '__main__':
    seed_supabase()

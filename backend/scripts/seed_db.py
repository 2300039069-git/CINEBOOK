"""
CineBook Supabase Database Seeder Script
Usage:
    python scripts/seed_db.py
Seeds Supabase PostgreSQL with Movies, Theatres, Screens, Shows, and Sample Events.
"""

import asyncio
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import connect_to_supabase, close_supabase_connection, seed_supabase_data_if_empty, db_manager

async def seed_database():
    print("Connecting to Supabase PostgreSQL...")
    await connect_to_supabase()
    
    if not db_manager.is_connected:
        print("Failed to connect to Supabase. Check SUPABASE_DB_URL in your environment or .env file.")
        return

    print("Running Supabase schema check and data seeder...")
    await seed_supabase_data_if_empty()

    movies_count = await db_manager.fetchval("SELECT COUNT(*) FROM movies;")
    theatres_count = await db_manager.fetchval("SELECT COUNT(*) FROM theatres;")
    shows_count = await db_manager.fetchval("SELECT COUNT(*) FROM shows;")
    events_count = await db_manager.fetchval("SELECT COUNT(*) FROM events;")

    print(f"\n✓ Seeding verified:")
    print(f"  - Movies: {movies_count}")
    print(f"  - Theatres: {theatres_count}")
    print(f"  - Shows: {shows_count}")
    print(f"  - Events: {events_count}")

    await close_supabase_connection()
    print("\nSupabase database seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())


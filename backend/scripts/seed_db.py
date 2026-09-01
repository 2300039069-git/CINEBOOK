"""
CineBook Database Seeder Script
Usage:
    python scripts/seed_db.py
Seeds MongoDB with Movies, Theatres, Screens, Shows, and Sample Admin Accounts.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.seed_data import SEED_MOVIES, SEED_THEATRES, SEED_SHOWS, SEED_EVENTS

async def seed_database():
    print(f"Connecting to MongoDB at: {settings.MONGODB_URI}...")
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.DATABASE_NAME]

    print("\n1. Seeding Movies Collection...")
    await db.movies.delete_many({})
    await db.movies.insert_many(SEED_MOVIES)
    print(f"   Inserted {len(SEED_MOVIES)} movies successfully.")

    print("\n2. Seeding Theatres Collection...")
    await db.theatres.delete_many({})
    await db.theatres.insert_many(SEED_THEATRES)
    print(f"   Inserted {len(SEED_THEATRES)} theatres successfully.")

    print("\n3. Seeding Shows Collection...")
    await db.shows.delete_many({})
    await db.shows.insert_many(SEED_SHOWS)
    print(f"   Inserted {len(SEED_SHOWS)} shows successfully.")

    print("\n4. Seeding Events Collection...")
    await db.events.delete_many({})
    await db.events.insert_many(SEED_EVENTS)
    print(f"   Inserted {len(SEED_EVENTS)} events successfully.")

    print("\nDatabase seeding completed successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())

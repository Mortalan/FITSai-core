import csv
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add backend to path
sys.path.append('/home/felicia/momo-core/backend')
from app.models.achievement import Achievement
from app.core.config import settings

async def seed():
    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    with open('/home/felicia/momo-core/achievements_dump.csv', mode='r') as f:
        reader = csv.DictReader(f)
        async with async_session() as session:
            for row in reader:
                # Map CSV to new Model
                ach = Achievement(
                    name=row['name'],
                    description=row['description'],
                    icon=row['icon'],
                    rarity="COMMON" if row['type'] == 'standard' else "RARE", # Approximation
                    xp_reward=50 # Default, actual reward was in JSON
                )
                session.add(ach)
            await session.commit()
    print("Achievements seeded!")

asyncio.run(seed())

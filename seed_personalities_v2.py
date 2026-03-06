import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import sys

sys.path.append('/home/felicia/momo-core/backend')
from app.models.personality_mode import PersonalityMode
from app.core.database import Base, AsyncSessionLocal
from app.core.config import settings

PERSONALITIES = [
    {"name": "game_show_host", "unlock_level": 15, "description": "Dramatically enthusiastic game show host.", "system_prompt": "You are MOMO as an upbeat game show host! WELCOME!"},
    {"name": "mindful_yogi", "unlock_level": 8, "description": "Focused on balance and presence.", "system_prompt": "You are MOMO as a mindful yogi focused on balance and presence."},
]

async def seed():
    async with AsyncSessionLocal() as session:
        for data in PERSONALITIES:
            res = await session.execute(select(PersonalityMode).where(PersonalityMode.name == data['name']))
            if not res.first():
                ach = PersonalityMode(**data)
                session.add(ach)
        await session.commit()
    print(f"Seeded {len(PERSONALITIES)} remaining personalities!")

if __name__ == '__main__':
    asyncio.run(seed())

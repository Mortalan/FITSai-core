import asyncio
from app.core.database import AsyncSessionLocal
from app.services.personality_service import personality_service

async def run():
    async with AsyncSessionLocal() as db:
        modes = await personality_service.get_available_modes(db, 100) # Give it a high level to fetch all
        print([m.name for m in modes])

if __name__ == '__main__':
    import sys
    import os
    sys.path.append('/home/felicia/momo-core/backend')
    os.chdir('/home/felicia/momo-core/backend')
    asyncio.run(run())

import httpx
import asyncio

async def test():
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzMzMjU2ODksInN1YiI6IjEifQ.9aiIqDTqejP4uG6dOPzlvFT_ooOcXZUvW0aCga3xbfg' # User ID 1 token from logs
    headers = {'Authorization': f'Bearer {token}'}
    urls = [
        'http://localhost:9000/api/v1/personality/list',
        'http://localhost:9000/api/v1/progression/achievements',
        'http://localhost:9000/api/v1/progression/leaderboard',
        'http://localhost:9000/api/v1/suggestions/',
        'http://localhost:9000/api/v1/roadmap',
        'http://localhost:9000/api/v1/admin/downloads'
    ]
    
    async with httpx.AsyncClient() as client:
        for url in urls:
            try:
                resp = await client.get(url, headers=headers)
                print(f"{url}: {resp.status_code} - Data Count: {len(resp.json()) if isinstance(resp.json(), list) else 'Object'}")
                if resp.status_code != 200: print(f"Error Body: {resp.text}")
            except Exception as e:
                print(f"{url}: Failed - {e}")

if __name__ == '__main__':
    asyncio.run(test())

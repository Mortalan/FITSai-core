import httpx
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

class GLPIService:
    """Manages integration with GLPI Asset Management."""
    
    def __init__(self):
        self.base_url = "" # To be set from .env
        self.app_token = "" 
        self.user_token = ""
        self.session_token: Optional[str] = None

    async def init_session(self) -> bool:
        """Initializes a GLPI API session."""
        headers = {
            "App-Token": self.app_token,
            "Authorization": f"user_token {self.user_token}"
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{self.base_url}/initSession", headers=headers)
                if response.status_code == 200:
                    self.session_token = response.json().get("session_token")
                    return True
                return False
            except Exception as e:
                logger.error(f"GLPI Init error: {e}")
                return False

    async def search_assets(self, query: str) -> List[Dict[str, Any]]:
        """Searches for assets (Computers, etc) in GLPI."""
        if not self.session_token: await self.init_session()
        
        headers = {
            "App-Token": self.app_token,
            "Session-Token": self.session_token
        }
        async with httpx.AsyncClient() as client:
            try:
                # Example search for computers
                response = await client.get(f"{self.base_url}/Computer?searchText={query}", headers=headers)
                return response.json() if response.status_code == 200 else []
            except Exception as e:
                logger.error(f"GLPI Search error: {e}")
                return []

glpi_service = GLPIService()

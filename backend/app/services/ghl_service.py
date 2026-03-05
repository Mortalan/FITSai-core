import httpx
import logging
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class GHLService:
    """Manages integration with GoHighLevel CRM."""
    
    BASE_URL = "https://services.leadconnectorhq.com"
    
    def __init__(self):
        self.api_key = "" # To be set from .env or vault
        self.location_id = "" # To be set from .env
        
    async def get_contact_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Searches for a contact in GHL by email."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Version": "2021-07-28"
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/contacts/search?locationId={self.location_id}&query={email}",
                    headers=headers
                )
                if response.status_code == 200:
                    contacts = response.json().get("contacts", [])
                    return contacts[0] if contacts else None
                return None
            except Exception as e:
                logger.error(f"GHL error: {e}")
                return None

ghl_service = GHLService()

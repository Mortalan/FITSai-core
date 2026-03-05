import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from sentence_transformers import SentenceTransformer
from app.core.config import settings

logger = logging.getLogger(__name__)

class MemoryService:
    """Manages Momo's long-term and short-term memory using ChromaDB."""

    def __init__(self):
        self.persist_directory = "/mnt/felicia_storage/momo_chromadb"
        self.client = chromadb.PersistentClient(path=self.persist_directory)
        
        # FORCE CPU usage to avoid OOM with Felicia's local AI
        logger.info("Loading embedding model on CPU to avoid GPU VRAM conflict...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
        
        self.collection = self.client.get_or_create_collection(name="momo_memory")

    async def store_memory(self, user_id: int, content: str, metadata: Dict[str, Any] = None):
        """Stores a new fact or interaction in the vector database."""
        if metadata is None: metadata = {}
        metadata["user_id"] = user_id
        
        doc_id = f"user_{user_id}_{os.urandom(4).hex()}"
        self.collection.add(
            documents=[content],
            metadatas=[metadata],
            ids=[doc_id]
        )
        logger.info(f"Stored memory for user {user_id}: {content[:50]}...")

    async def search_memories(self, user_id: int, query: str, limit: int = 5) -> List[str]:
        """Retrieves relevant memories for a user based on semantic search."""
        results = self.collection.query(
            query_texts=[query],
            where={"user_id": user_id},
            n_results=limit
        )
        return results["documents"][0] if results["documents"] else []

memory_service = MemoryService()

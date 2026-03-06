import chromadb
import logging
import os
from typing import List, Dict, Optional
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class RAGService:
    """Retrieval-Augmented Generation service for the Knowledge Base."""
    
    def __init__(self):
        self.persist_directory = "/mnt/felicia_storage/momo_rag_db"
        os.makedirs(self.persist_directory, exist_ok=True)
        
        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(path=self.persist_directory)
        
        # Load embedding model on CPU to avoid CUDA OOM alongside local AI
        logger.info("Loading RAG embedding model on CPU...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
        
        self.collection = self.client.get_or_create_collection(
            name="company_knowledge",
            metadata={"description": "Momo company knowledge base / SOPs"}
        )
        logger.info(f"RAG Collection initialized. Document chunks: {self.collection.count()}")

    def _chunk_text(self, text: str, chunk_size: int = 250, overlap: int = 50) -> List[str]:
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk: chunks.append(chunk)
        return chunks

    def ingest_document(self, doc_id: int, title: str, content: str, department_id: Optional[int] = None):
        """Chunks, embeds, and stores a document in the vector DB."""
        chunks = self._chunk_text(content)
        
        ids = []
        documents = []
        metadatas = []
        embeddings = []
        
        for idx, chunk in enumerate(chunks):
            chunk_id = f"doc_{doc_id}_chunk_{idx}"
            
            ids.append(chunk_id)
            documents.append(chunk)
            metadatas.append({
                "doc_id": doc_id,
                "title": title,
                "department_id": department_id or 0
            })
            
        if documents:
            # Generate embeddings
            embeddings = self.model.encode(documents).tolist()
            
            # Store in Chroma
            self.collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas,
                embeddings=embeddings
            )
            logger.info(f"Ingested {len(chunks)} chunks for document '{title}'")

    def search_knowledge_base(self, query: str, top_k: int = 3, department_id: Optional[int] = None) -> str:
        """Searches the RAG database for relevant SOPs or documents."""
        if self.collection.count() == 0:
            return "Knowledge Base is currently empty."
            
        query_embedding = self.model.encode([query]).tolist()[0]
        
        try:
            # Simple global search for now
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                include=["documents", "metadatas"]
            )
            
            if not results["documents"] or not results["documents"][0]:
                return "No relevant documents found in the Knowledge Base."
                
            formatted_results = []
            for i, doc in enumerate(results["documents"][0]):
                meta = results["metadatas"][0][i]
                formatted_results.append(f"--- SOURCE: {meta.get('title')} ---\n{doc}\n")
                
            return "\n".join(formatted_results)
            
        except Exception as e:
            logger.error(f"RAG search failed: {e}")
            return f"Error searching Knowledge Base: {e}"

rag_service = RAGService()

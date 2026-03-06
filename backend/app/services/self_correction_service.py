import json
import logging
from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)

class SelfCorrectionService:
    """Background service that grades Momo's responses and learns from mistakes."""

    def __init__(self):
        self.model = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)

    async def grade_response(self, question: str, answer: str, user_id: int):
        """Asynchronously grades a substantive response."""
        if len(answer) < 50: return # Skip brief greetings/acknowledgements
        
        prompt = f"""You are an expert QA evaluator for an AI assistant.
        Review the following interaction. If the assistant made a technical error, hallucinated, or gave poor advice, extract the corrected knowledge.
        Return ONLY a JSON object. Format: {{"is_error": bool, "correction": "str or null"}}
        
        User: {question}
        Assistant: {answer}
        """
        
        try:
            response = await self.model.ainvoke([SystemMessage(content=prompt)])
            data = json.loads(response.content)
            
            if data.get("is_error") and data.get("correction"):
                logger.info(f"Self-Correction Triggered: {data['correction']}")
                # Store the correction in the RAG DB as a high-priority lesson
                rag_service.ingest_document(
                    doc_id=999999, # Special ID for learned lessons
                    title="Learned Correction",
                    content=data['correction'],
                    department_id=0
                )
        except Exception as e:
            logger.error(f"Self-correction grading failed: {e}")

self_correction_service = SelfCorrectionService()

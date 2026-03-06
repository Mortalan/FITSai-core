import logging
from typing import Dict, Optional
from app.core.config import settings
from app.services.openai_service import openai_service

logger = logging.getLogger(__name__)

class DocumentAnalysisService:
    ANALYSIS_MODES = {
        "summarize": "Create a concise summary of this document. Focus on main points.",
        "analyze": "Provide detailed technical analysis including topics, key points, and recommendations.",
        "extract_facts": "Extract key technical facts, dates, and names as a list.",
        "memorize": "Identify critical information that should be remembered for future reference."
    }

    async def analyze_document(self, text: str, filename: str, mode: str, user_id: int) -> str:
        instruction = self.ANALYSIS_MODES.get(mode, "Analyze this document.")
        prompt = f"Document: {filename}\n\nTask: {instruction}\n\nContent:\n{text[:15000]}"
        
        # Use simple non-streaming query
        from langchain_openai import ChatOpenAI
        from langchain_core.messages import HumanMessage
        
        model = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)
        res = await model.ainvoke([HumanMessage(content=prompt)])
        return res.content

document_analysis = DocumentAnalysisService()

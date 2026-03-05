import json
import logging
from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings

logger = logging.getLogger(__name__)

class MemoryExtractor:
    """Uses LLM to extract key facts and preferences from chat interactions."""

    def __init__(self):
        self.model = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)

    async def extract_facts(self, question: str, answer: str) -> List[str]:
        """Analyzes a QA pair and returns a list of new facts to remember."""
        prompt = """You are a memory extraction engine. 
        Analyze the following interaction and extract key facts about the user, their preferences, or their environment.
        Return ONLY a JSON list of strings. If no new facts, return [].
        
        Example Output: ["User uses Ubuntu 24.04", "User prefers dark mode", "User is a network admin"]
        
        Interaction:
        User: {question}
        Assistant: {answer}
        """
        
        try:
            response = await self.model.ainvoke([
                SystemMessage(content=prompt.format(question=question, answer=answer))
            ])
            facts = json.loads(response.content)
            return facts if isinstance(facts, list) else []
        except Exception as e:
            logger.error(f"Memory extraction failed: {e}")
            return []

memory_extractor = MemoryExtractor()

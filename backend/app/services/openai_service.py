from typing import Optional, AsyncGenerator, List
from sqlalchemy.ext.asyncio import AsyncSession
from openai import AsyncOpenAI
from app.core.config import settings
from app.models.user import User
from app.services.personality_service import personality_service
from app.services.budget_service import budget_service
import logging
import json

logger = logging.getLogger(__name__)

class OpenAIService:
    """Service for OpenAI API interactions with cost tracking."""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o"
    
    async def query_stream(
        self,
        question: str,
        user_id: int,
        db: AsyncSession,
        conversation_id: Optional[int] = None,
        image_data: Optional[str] = None,
        image_mime: Optional[str] = "image/png",
        system_prompt_override: Optional[str] = None,
        tools: Optional[List[dict]] = None,
        messages: Optional[List[dict]] = None
    ) -> AsyncGenerator[dict, None]:
        """Generate streaming answer using OpenAI API with Vision support."""
        
        try:
            system_prompt = system_prompt_override or "You are Momo, an autonomous AI assistant."
            
            # 1. Build Messages
            api_messages = []
            if messages:
                api_messages = list(messages)
                # Ensure system prompt is present
                if not any(m['role'] == 'system' for m in api_messages):
                    api_messages.insert(0, {"role": "system", "content": system_prompt})
            else:
                api_messages = [{"role": "system", "content": system_prompt}]
                
                # 2. Handle User Content (Text + Vision)
                if image_data:
                    user_content = [
                        {"type": "text", "text": question},
                        {"type": "image_url", "image_url": {"url": f"data:{image_mime};base64,{image_data}"}}
                    ]
                    api_messages.append({"role": "user", "content": user_content})
                else:
                    api_messages.append({"role": "user", "content": question})

            # 3. Call API
            api_kwargs = {
                "model": self.model,
                "messages": api_messages,
                "stream": True,
                "stream_options": {"include_usage": True}
            }
            if tools:
                api_kwargs["tools"] = tools
                api_kwargs["tool_choice"] = "auto"

            stream = await self.client.chat.completions.create(**api_kwargs)
            
            full_content = ""
            tool_calls = []
            
            async for chunk in stream:
                if chunk.choices:
                    delta = chunk.choices[0].delta
                    if delta.content:
                        full_content += delta.content
                        yield {"type": "token", "content": delta.content}
                    
                    if delta.tool_calls:
                        for tc in delta.tool_calls:
                            if tc.index >= len(tool_calls):
                                tool_calls.append({
                                    "id": tc.id or "",
                                    "type": "function",
                                    "function": {
                                        "name": tc.function.name if tc.function else "",
                                        "arguments": tc.function.arguments if tc.function else ""
                                    }
                                })
                            else:
                                if tc.function.arguments:
                                    tool_calls[tc.index]["function"]["arguments"] += tc.function.arguments

                if chunk.usage:
                    # Final yield with usage metadata
                    yield {
                        "type": "done", 
                        "full_content": full_content, 
                        "tool_calls": tool_calls if tool_calls else None,
                        "usage": {
                            "prompt_tokens": chunk.usage.prompt_tokens,
                            "completion_tokens": chunk.usage.completion_tokens
                        }
                    }
            
        except Exception as e:
            logger.error(f"OpenAI streaming error: {e}")
            yield {"type": "error", "message": str(e)}

openai_service = OpenAIService()

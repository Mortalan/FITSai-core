import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class SelfLearningLogger:
    def __init__(self, output_file: str = "/var/lib/momo/training/dpo_data.jsonl"):
        self.output_file = Path(output_file)
        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        self.openai_api_key = settings.OPENAI_API_KEY

    async def log_negative_feedback(self, query: str, context: str, rejected_response: str, metadata: dict = None):
        try:
            # Get 'Gold Standard' answer from GPT-4o
            system_prompt = "You are an expert AI. Think step-by-step inside <thought></thought> then provide the perfect answer."
            user_msg = f"Context: {context}\n\nQuestion: {query}"
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.openai_api_key}"},
                    json={
                        "model": "gpt-4o",
                        "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_msg}]
                    }
                )
                chosen_response = resp.json()["choices"][0]["message"]["content"]

            entry = {
                "prompt": f"[INST] Context: {context}\nQuestion: {query} [/INST]",
                "chosen": chosen_response,
                "rejected": rejected_response,
                "metadata": {"timestamp": datetime.utcnow().isoformat(), **(metadata or {})}
            }
            with open(self.output_file, "a") as f:
                f.write(json.dumps(entry) + "\n")
            logger.info(f"Logged DPO training pair to {self.output_file}")
        except Exception as e:
            logger.error(f"Self-learning log failed: {e}")

self_learning_logger = SelfLearningLogger()

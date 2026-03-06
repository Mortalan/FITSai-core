from fastapi import APIRouter
from typing import List

router = APIRouter()

TEMPLATES = [
    {"id": 1, "name": "Generate SOP", "category": "Writing", "prompt": "Please write a comprehensive Standard Operating Procedure (SOP) for...", "description": "Structured template for creating technical documentation."},
    {"id": 2, "name": "Code Review", "category": "Coding", "prompt": "Review the following code for security vulnerabilities and performance issues:\n\n```\n\n```", "description": "Deep dive into code quality."},
    {"id": 3, "name": "Troubleshoot Network", "category": "IT Support", "prompt": "I am experiencing a network issue. The symptoms are:\n1.\n2.\n\nWhat diagnostic commands should I run?", "description": "Step-by-step diagnostic plan."},
    {"id": 4, "name": "Explain to Non-Tech", "category": "Communication", "prompt": "Explain the concept of [CONCEPT] using a simple analogy suitable for a non-technical manager.", "description": "Translates complex IT concepts into business language."}
]

@router.get("/", response_model=List[dict])
async def list_templates():
    return TEMPLATES

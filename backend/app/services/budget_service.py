from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.budget import DepartmentBudget, ApiUsage
from app.models.user import User
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class BudgetService:
    """Tracks and limits AI API spending."""

    # Current GPT-4o pricing (estimated per 1M tokens)
    PRICING = {
        "gpt-4o": {"input": 2.50, "output": 10.00},
        "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    }

    async def track_usage(
        self, 
        db: AsyncSession, 
        user: User, 
        model_name: str, 
        prompt_tokens: int, 
        completion_tokens: int
    ) -> float:
        """Calculates and records the cost of an API call."""
        pricing = self.PRICING.get(model_name, self.PRICING["gpt-4o-mini"])
        cost = (prompt_tokens / 1_000_000 * pricing["input"]) + (completion_tokens / 1_000_000 * pricing["output"])
        
        # Record Usage
        usage = ApiUsage(
            user_id=user.id,
            model_name=model_name,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            cost=cost
        )
        db.add(usage)
        
        # Update Department Budget
        if user.department_id:
            result = await db.execute(select(DepartmentBudget).where(DepartmentBudget.department_id == user.department_id))
            budget = result.scalar_one_or_none()
            if budget:
                budget.current_spend += cost
        
        await db.commit()
        return cost

    async def check_budget(self, db: AsyncSession, department_id: int) -> bool:
        """Checks if a department has remaining budget."""
        if not department_id: return True # Default allow
        
        result = await db.execute(select(DepartmentBudget).where(DepartmentBudget.department_id == department_id))
        budget = result.scalar_one_or_none()
        if not budget: return True # No limit set
        
        return budget.current_spend < budget.monthly_limit

budget_service = BudgetService()

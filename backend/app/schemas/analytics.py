from pydantic import BaseModel
from typing import Dict, Optional

class BudgetAnalyticsResponse(BaseModel):
    sector: str
    total_allocation: float
    yearly_distribution: Dict[str, float]
    growth_rate: float
    largest_year: Optional[int]

class BudgetSummaryRequest(BaseModel):
    sector: str
    total_allocation: float
    growth_rate: float
    largest_year: int

class BudgetSummaryResponse(BaseModel):
    summary: str
from pydantic import BaseModel
from typing import Optional

class BudgetBase(BaseModel):
    sector_id: int
    year: int
    amount: float
    description: str

class BudgetCreate(BudgetBase):
    pass

class BudgetRead(BudgetBase):
    id: int
    
    class Config:
        from_attributes = True
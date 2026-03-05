from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BudgetBase(BaseModel):
    sector_id: int
    year: int
    amount: float
    description: str
    county: Optional[str] = None

class BudgetCreate(BudgetBase):
    pass

class BudgetRead(BudgetBase):
    id: int
    citizen_explanation: Optional[str] = None
    
    class Config:
        from_attributes = True

# Legacy schema for backward compatibility
class BudgetLegacyCreate(BaseModel):
    sector_id: int
    year: int
    amount: int
    description: str

class BudgetLegacyRead(BaseModel):
    id: int
    sector_id: Optional[int] = None
    year: Optional[int] = None
    amount: Optional[int] = None
    description: str
    county: Optional[str] = None
    
    class Config:
        from_attributes = True
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BudgetBase(BaseModel):
    fiscal_year: str
    sector: str
    program: str
    sub_program: str
    county: str
    budget_type: str
    allocation_kes: int
    expenditure_kes: int
    implementing_agency: str
    funding_source: str
    project_status: str
    description: str

class BudgetCreate(BudgetBase):
    pass

class BudgetRead(BudgetBase):
    id: int
    created_at: datetime
    
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
    
    class Config:
        from_attributes = True
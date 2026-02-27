from pydantic import BaseModel
from datetime import datetime

class ExpenditureCreate(BaseModel):
    budget_id: int
    amount: float
    description: str

class ExpenditureRead(BaseModel):
    id: int
    budget_id: int
    amount: float
    description: str
    date: datetime

    class Config:
        from_attributes = True

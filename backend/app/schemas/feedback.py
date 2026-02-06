from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class FeedbackStatus(str, Enum):
    submitted = "submitted"
    flagged = "flagged"
    approved = "approved"

class FeedbackCreate(BaseModel):
    sector_id: int
    message: str

class FeedbackRead(BaseModel):
    id: int
    user_id: int
    sector_id: int
    message: str
    status: FeedbackStatus
    created_at: datetime
    
    class Config:
        from_attributes = True
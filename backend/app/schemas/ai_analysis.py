from pydantic import BaseModel
from datetime import datetime

class AIAnalysisCreate(BaseModel):
    feedback_id: int
    text: str

class AIAnalysisRead(BaseModel):
    id: int
    feedback_id: int
    is_clean: bool
    summary: str
    confidence_score: float
    created_at: datetime
    
    class Config:
        from_attributes = True
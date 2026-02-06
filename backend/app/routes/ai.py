from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter(prefix="/ai", tags=["ai"])

class ModerationRequest(BaseModel):
    text: str

class ModerationResponse(BaseModel):
    is_clean: bool
    summary: str
    confidence_score: float

@router.post("/moderate", response_model=ModerationResponse)
def moderate_feedback(request: ModerationRequest):
    # Mock AI moderation logic
    text = request.text.lower()
    
    # Simple keyword-based mock moderation
    flagged_words = ["spam", "hate", "inappropriate", "offensive"]
    is_flagged = any(word in text for word in flagged_words)
    
    return ModerationResponse(
        is_clean=not is_flagged,
        summary=f"Analyzed {len(request.text)} characters. {'Clean content' if not is_flagged else 'Potentially inappropriate content detected'}",
        confidence_score=round(random.uniform(0.7, 0.95), 2)
    )
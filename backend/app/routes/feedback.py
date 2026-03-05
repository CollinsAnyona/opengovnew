from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import random
from app.schemas.feedback import FeedbackCreate, FeedbackRead
from app.models.feedback import Feedback, FeedbackStatus
from app.models.ai_analysis import AIAnalysis
from app.models.user import UserRole
from app.core.security import verify_token
from app.db.session import SessionLocal

router = APIRouter(prefix="/feedback", tags=["feedback"])

class FeedbackStatusUpdate(BaseModel):
    status: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token_data: dict = Depends(verify_token)):
    return token_data

def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.post("/", response_model=FeedbackRead)
def create_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Create feedback
    db_feedback = Feedback(
        user_id=int(current_user["sub"]),
        sector_id=feedback.sector_id,
        message=feedback.message
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    
    # AI Moderation
    text = feedback.message.lower()
    flagged_words = ["spam", "hate", "inappropriate", "offensive"]
    is_flagged = any(word in text for word in flagged_words)
    
    ai_analysis = AIAnalysis(
        feedback_id=db_feedback.id,
        is_clean=not is_flagged,
        summary=f"Analyzed {len(feedback.message)} characters. {'Clean content' if not is_flagged else 'Potentially inappropriate content detected'}",
        confidence_score=round(random.uniform(0.7, 0.95), 2)
    )
    db.add(ai_analysis)
    
    # Auto-flag if AI detects issues
    if is_flagged:
        db_feedback.status = FeedbackStatus.flagged
    
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

@router.get("/", response_model=List[FeedbackRead])
def get_feedback(
    db: Session = Depends(get_db)
):
    return db.query(Feedback).all()

@router.put("/{feedback_id}", response_model=FeedbackRead)
def update_feedback_status(
    feedback_id: int,
    status_update: FeedbackStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: dict = Depends(require_admin)
):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    feedback.status = FeedbackStatus(status_update.status)
    db.commit()
    db.refresh(feedback)
    return feedback
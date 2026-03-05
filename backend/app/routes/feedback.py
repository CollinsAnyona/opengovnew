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
from app.services.email_service import send_feedback_status_email
from app.models.user import User
from app.services.gemini_service import GeminiAIService
from app.models.budget import Budget
from app.models.expenditure import Expenditure
from sqlalchemy import func

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
    
    # Gather real context data for personalized AI analysis
    sector_budget = db.query(func.sum(Budget.amount)).filter(
        Budget.sector_id == feedback.sector_id
    ).scalar() or 0
    
    sector_spent = db.query(func.sum(Expenditure.amount)).join(
        Budget, Expenditure.budget_id == Budget.id
    ).filter(Budget.sector_id == feedback.sector_id).scalar() or 0
    
    utilization_rate = (sector_spent / sector_budget * 100) if sector_budget > 0 else 0
    
    similar_feedback_count = db.query(func.count(Feedback.id)).filter(
        Feedback.sector_id == feedback.sector_id,
        Feedback.status != FeedbackStatus.approved
    ).scalar() or 0
    
    context = {
        "sector_budget": sector_budget,
        "sector_spent": sector_spent,
        "utilization_rate": utilization_rate,
        "similar_feedback_count": similar_feedback_count,
        "trends": f"{similar_feedback_count} pending feedback items in this sector"
    }
    
    # AI Analysis using Gemini with real context
    analysis = GeminiAIService.analyze_feedback(feedback.message, str(feedback.sector_id), context)
    
    ai_analysis = AIAnalysis(
        feedback_id=db_feedback.id,
        is_clean=not analysis.get('actionable', False),
        summary=analysis.get('summary', 'Feedback received'),
        confidence_score=analysis.get('confidence', 0.8)
    )
    db.add(ai_analysis)
    
    # Auto-flag based on priority
    if analysis.get('priority') in ['high', 'urgent']:
        db_feedback.status = FeedbackStatus.escalated
    
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

@router.get("/", response_model=List[FeedbackRead])
def get_feedback(
    db: Session = Depends(get_db)
):
    return db.query(Feedback).all()

@router.get("/{feedback_id}/analysis")
def get_feedback_analysis(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get AI analysis and personalized response for feedback"""
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    ai_analysis = db.query(AIAnalysis).filter(AIAnalysis.feedback_id == feedback_id).first()
    if not ai_analysis:
        return {"message": "No analysis available"}
    
    # Get context for personalized response
    sector_budget = db.query(func.sum(Budget.amount)).filter(
        Budget.sector_id == feedback.sector_id
    ).scalar() or 0
    
    sector_spent = db.query(func.sum(Expenditure.amount)).join(
        Budget, Expenditure.budget_id == Budget.id
    ).filter(Budget.sector_id == feedback.sector_id).scalar() or 0
    
    utilization_rate = (sector_spent / sector_budget * 100) if sector_budget > 0 else 0
    
    context = {
        "sector_budget": sector_budget,
        "sector_spent": sector_spent,
        "utilization_rate": utilization_rate
    }
    
    # Re-analyze with context for personalized response
    analysis = GeminiAIService.analyze_feedback(feedback.message, str(feedback.sector_id), context)
    
    return {
        "summary": ai_analysis.summary,
        "confidence": ai_analysis.confidence_score,
        "personalized_response": analysis.get('personalized_response', 'Thank you for your feedback.'),
        "context": context
    }

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
    
    old_status = feedback.status.value
    new_status = status_update.status
    
    feedback.status = FeedbackStatus(new_status)
    db.commit()
    db.refresh(feedback)
    
    # Send email notification to user
    user = db.query(User).filter(User.id == feedback.user_id).first()
    if user and user.email:
        try:
            send_feedback_status_email(
                user_email=user.email,
                user_name=user.name,
                feedback_id=feedback.id,
                old_status=old_status,
                new_status=new_status
            )
        except Exception as e:
            print(f"Failed to send email notification: {e}")
    
    return feedback
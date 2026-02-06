from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.feedback import FeedbackCreate, FeedbackRead
from app.models.feedback import Feedback
from app.models.user import UserRole
from app.core.security import verify_token
from app.db.session import SessionLocal

router = APIRouter(prefix="/feedback", tags=["feedback"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token_data: dict = Depends(verify_token)):
    return token_data

def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.post("/", response_model=FeedbackRead)
def create_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_feedback = Feedback(
        user_id=int(current_user["sub"]),
        sector_id=feedback.sector_id,
        message=feedback.message
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

@router.get("/", response_model=List[FeedbackRead])
def get_feedback(
    db: Session = Depends(get_db),
    admin_user: dict = Depends(require_admin)
):
    return db.query(Feedback).all()
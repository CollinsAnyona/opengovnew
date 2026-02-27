from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.ai_analysis import AIAnalysisCreate, AIAnalysisRead
from app.schemas.analytics import BudgetSummaryRequest, BudgetSummaryResponse
from app.models.ai_analysis import AIAnalysis
from app.db.session import SessionLocal
from app.services.ai_service import AIService
import random

router = APIRouter(prefix="/ai", tags=["ai"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/moderate", response_model=AIAnalysisRead)
def moderate_feedback(request: AIAnalysisCreate, db: Session = Depends(get_db)):
    text = request.text.lower()
    
    flagged_words = ["spam", "hate", "inappropriate", "offensive"]
    is_flagged = any(word in text for word in flagged_words)
    
    is_clean = not is_flagged
    summary = f"Analyzed {len(request.text)} characters. {'Clean content' if is_clean else 'Potentially inappropriate content detected'}"
    confidence_score = round(random.uniform(0.7, 0.95), 2)
    
    db_analysis = AIAnalysis(
        feedback_id=request.feedback_id,
        is_clean=is_clean,
        summary=summary,
        confidence_score=confidence_score
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    return db_analysis

@router.get("/analysis", response_model=List[AIAnalysisRead])
def get_all_analysis(db: Session = Depends(get_db)):
    return db.query(AIAnalysis).all()

@router.post("/summarize-budget", response_model=BudgetSummaryResponse)
def summarize_budget(request: BudgetSummaryRequest):
    summary = AIService.generate_budget_summary(
        request.sector,
        request.total_allocation,
        request.growth_rate,
        request.largest_year
    )
    return BudgetSummaryResponse(summary=summary)
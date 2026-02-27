from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict
from app.db.session import SessionLocal
from app.models.budget import Budget
from app.models.expenditure import Expenditure
from app.models.feedback import Feedback
from app.models.sector import Sector
from app.core.security import verify_token

router = APIRouter(prefix="/ai/insights", tags=["ai-insights"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token_data: dict = Depends(verify_token)):
    return token_data

@router.get("/{sector}")
def get_sector_insights(
    sector: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
) -> Dict:
    """Generate AI insights for a specific sector"""
    
    # Get sector data
    sector_obj = db.query(Sector).filter(Sector.name == sector).first()
    if not sector_obj:
        return {"error": "Sector not found"}
    
    # Budget analysis
    budgets = db.query(Budget).filter(Budget.sector_id == sector_obj.id).all()
    total_budget = sum(b.amount for b in budgets)
    
    # Expenditure analysis
    budget_ids = [b.id for b in budgets]
    expenditures = db.query(Expenditure).filter(Expenditure.budget_id.in_(budget_ids)).all()
    total_spent = sum(e.amount for e in expenditures)
    
    # Feedback analysis
    feedback_list = db.query(Feedback).filter(Feedback.sector_id == sector_obj.id).all()
    total_feedback = len(feedback_list)
    approved_feedback = len([f for f in feedback_list if f.status == 'approved'])
    flagged_feedback = len([f for f in feedback_list if f.status == 'flagged'])
    
    # Calculate metrics
    utilization_rate = (total_spent / total_budget * 100) if total_budget > 0 else 0
    remaining = total_budget - total_spent
    
    # Generate citizen-friendly insights
    insights = {
        "sector": sector.capitalize(),
        "summary": generate_summary(sector, total_budget, total_spent, utilization_rate, remaining),
        "spending_status": get_spending_status(utilization_rate),
        "citizen_engagement": get_engagement_insight(total_feedback, approved_feedback, flagged_feedback),
        "recommendations": generate_recommendations(utilization_rate, flagged_feedback, total_feedback),
        "metrics": {
            "total_budget": total_budget,
            "total_spent": total_spent,
            "remaining": remaining,
            "utilization_rate": round(utilization_rate, 1),
            "total_feedback": total_feedback,
            "approved_feedback": approved_feedback
        }
    }
    
    return insights

def generate_summary(sector: str, budget: float, spent: float, rate: float, remaining: float) -> str:
    """Generate simple language summary"""
    return (
        f"In the {sector} sector, the government set aside KSh {budget:,.0f}. "
        f"So far, KSh {spent:,.0f} ({rate:.1f}%) has been used. "
        f"This leaves KSh {remaining:,.0f} available for more projects. "
        f"{get_spending_interpretation(rate)}"
    )

def get_spending_interpretation(rate: float) -> str:
    """Interpret spending rate in simple terms"""
    if rate < 30:
        return "The money is being spent slowly - there's room to do more projects."
    elif rate < 60:
        return "Spending is steady and on track."
    elif rate < 85:
        return "Most of the budget is being used - good progress."
    else:
        return "Almost all the money has been spent. New budget may be needed soon."

def get_spending_status(rate: float) -> str:
    """Get spending status label"""
    if rate < 50:
        return "Low Utilization"
    elif rate < 80:
        return "On Track"
    else:
        return "High Utilization"

def get_engagement_insight(total: int, approved: int, flagged: int) -> str:
    """Analyze citizen engagement"""
    if total == 0:
        return "No citizen feedback yet. Your voice matters - submit feedback to help improve governance."
    
    engagement_rate = (approved / total * 100) if total > 0 else 0
    
    insight = f"{total} citizens have shared their views. "
    
    if flagged > 0:
        insight += f"{flagged} submissions needed review for inappropriate content. "
    
    if engagement_rate > 50:
        insight += "Many concerns have been approved and are being considered by officials."
    else:
        insight += "Officials are reviewing the feedback to take action."
    
    return insight

def generate_recommendations(utilization: float, flagged: int, total_feedback: int) -> list:
    """Generate actionable recommendations"""
    recommendations = []
    
    if utilization < 50:
        recommendations.append("Speed up project implementation to use available funds effectively")
    elif utilization > 90:
        recommendations.append("Plan for next budget cycle - current funds nearly exhausted")
    
    if flagged > 0 and total_feedback > 0:
        flagged_rate = (flagged / total_feedback * 100)
        if flagged_rate > 20:
            recommendations.append("High rate of flagged feedback - improve citizen communication guidelines")
    
    if total_feedback < 10:
        recommendations.append("Increase citizen awareness campaigns to gather more community input")
    
    if not recommendations:
        recommendations.append("Continue current governance practices - metrics are healthy")
    
    return recommendations

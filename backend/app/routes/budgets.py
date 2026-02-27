from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.schemas.budget import BudgetCreate, BudgetRead
from app.schemas.analytics import BudgetAnalyticsResponse
from app.models.budget import Budget
from app.models.sector import Sector
from app.models.user import UserRole
from app.core.security import verify_token
from app.db.session import SessionLocal
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/budgets", tags=["budgets"])

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

@router.get("/", response_model=List[BudgetRead])
def get_budgets(
    sector: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Budget)
    if sector:
        sector_obj = db.query(Sector).filter(Sector.name == sector).first()
        if not sector_obj:
            raise HTTPException(status_code=404, detail="Sector not found")
        query = query.filter(Budget.sector_id == sector_obj.id)
    return query.all()

@router.get("/analytics", response_model=BudgetAnalyticsResponse)
def get_budget_analytics(
    sector: str = Query(...),
    db: Session = Depends(get_db)
):
    result = AnalyticsService.calculate_budget_analytics(db, sector)
    if result is None:
        raise HTTPException(status_code=404, detail="Sector not found")
    return result

@router.post("/", response_model=BudgetRead)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    admin_user: dict = Depends(require_admin)
):
    db_budget = Budget(**budget.dict())
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget
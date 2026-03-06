from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.expenditure import ExpenditureCreate, ExpenditureRead
from app.models.expenditure import Expenditure
from app.core.security import verify_token
from app.db.session import SessionLocal

router = APIRouter(prefix="/expenditures", tags=["expenditures"])

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

@router.get("/")
def get_expenditures(db: Session = Depends(get_db)):
    from app.models.budget import Budget
    from app.models.sector import Sector
    from sqlalchemy.orm import joinedload
    
    expenditures = db.query(Expenditure).join(Budget).join(Sector).all()
    
    budget_map = {b.id: b for b in db.query(Budget).all()}
    sector_map = {s.id: s for s in db.query(Sector).all()}
    
    result = []
    for exp in expenditures:
        budget = budget_map.get(exp.budget_id)
        sector = sector_map.get(budget.sector_id) if budget else None
        result.append({
            "id": exp.id,
            "budget_id": exp.budget_id,
            "amount": exp.amount,
            "description": exp.description,
            "date": exp.date,
            "citizen_explanation": exp.citizen_explanation,
            "sector": sector.name if sector else None,
            "year": budget.year if budget else None
        })
    return result

@router.post("/", response_model=ExpenditureRead)
def create_expenditure(
    expenditure: ExpenditureCreate,
    db: Session = Depends(get_db),
    admin_user: dict = Depends(require_admin)
):
    db_expenditure = Expenditure(**expenditure.dict())
    db.add(db_expenditure)
    db.commit()
    db.refresh(db_expenditure)
    return db_expenditure

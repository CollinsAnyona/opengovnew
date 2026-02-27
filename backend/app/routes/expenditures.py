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

@router.get("/", response_model=List[ExpenditureRead])
def get_expenditures(db: Session = Depends(get_db)):
    return db.query(Expenditure).all()

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

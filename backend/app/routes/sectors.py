from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.sector import SectorCreate, SectorRead
from app.models.sector import Sector
from app.core.security import verify_token
from app.db.session import SessionLocal

router = APIRouter(prefix="/sectors", tags=["sectors"])

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

@router.post("/", response_model=SectorRead)
def create_sector(
    sector: SectorCreate, 
    db: Session = Depends(get_db),
    admin_user: dict = Depends(require_admin)
):
    db_sector = Sector(name=sector.name)
    db.add(db_sector)
    db.commit()
    db.refresh(db_sector)
    return db_sector

@router.get("/", response_model=List[SectorRead])
def get_sectors(db: Session = Depends(get_db)):
    return db.query(Sector).all()
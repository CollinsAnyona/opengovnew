from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
from app.schemas.budget import BudgetCreate, BudgetRead, BudgetLegacyCreate, BudgetLegacyRead
from app.schemas.analytics import BudgetAnalyticsResponse
from app.models.budget import Budget
from app.models.sector import Sector
from app.models.user import UserRole
from app.core.security import verify_token
from app.db.session import SessionLocal
from app.services.analytics_service import AnalyticsService
from app.services.budget_ingest_service import BudgetIngestService

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
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/", response_model=List[BudgetRead])
def get_budgets(
    sector: Optional[str] = Query(None),
    county: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Budget)
    if sector:
        # Find sector by name (case-insensitive) and filter by sector_id
        sector_obj = db.query(Sector).filter(Sector.name.ilike(sector)).first()
        if sector_obj:
            query = query.filter(Budget.sector_id == sector_obj.id)
        else:
            return []  # No sector found, return empty
    if county:
        query = query.filter(Budget.county.ilike(county))
    if year:
        query = query.filter(Budget.year == year)
    return query.all()

@router.get("/analytics", response_model=BudgetAnalyticsResponse)
def get_budget_analytics(
    sector: str = Query(...),
    county: Optional[str] = Query(None),
    budget_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    result = AnalyticsService.calculate_budget_analytics(db, sector, county, budget_type)
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

@router.post("/upload")
async def upload_budgets(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload budget data from CSV or XLSX file"""
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only .csv and .xlsx files are supported")
    
    try:
        # Read file content
        content = await file.read()
        
        # Parse file
        df = BudgetIngestService.parse_file(content, file.filename)
        
        # Process and insert data (validation happens inside)
        result = BudgetIngestService.process_upload(db, df)
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        error_detail = f"Upload failed: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)  # Print to console for debugging
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
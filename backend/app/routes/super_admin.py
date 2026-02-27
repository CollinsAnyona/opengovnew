from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import User, UserRole
from app.models.budget import Budget
from app.models.sector import Sector
from app.models.feedback import Feedback
from app.models.forum_post import ForumPost
from app.models.forum_reply import ForumReply
from app.models.audit_log import AuditLog
from app.core.security import hash_password, verify_token
from app.db.session import SessionLocal

router = APIRouter(prefix="/super-admin", tags=["super-admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def require_super_admin(token_data: dict = Depends(verify_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == int(token_data["sub"])).first()
    if not user or user.role != UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Super admin access required")
    return user

def log_action(db: Session, user_id: int, action: str, entity_type: str, entity_id: int = None, details: str = None):
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details
    )
    db.add(log)
    db.commit()

# User Management
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role.value,
        "is_active": u.is_active,
        "created_at": u.created_at
    } for u in users]

@router.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        role=UserRole[user.role]
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    log_action(db, 1, "create_user", "user", db_user.id, f"Created user: {user.email}")
    
    return {"message": "User created successfully", "user_id": db_user.id}

@router.put("/users/{user_id}")
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.name:
        user.name = user_update.name
    if user_update.email:
        user.email = user_update.email
    if user_update.role:
        user.role = UserRole[user_update.role]
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    db.commit()
    log_action(db, 1, "update_user", "user", user_id, f"Updated user: {user.email}")
    
    return {"message": "User updated successfully"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    log_action(db, 1, "delete_user", "user", user_id, f"Deleted user: {user.email}")
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

# Sector Management
class SectorCreate(BaseModel):
    name: str
    description: Optional[str] = None

@router.get("/sectors")
def get_all_sectors(db: Session = Depends(get_db)):
    sectors = db.query(Sector).all()
    return sectors

@router.post("/sectors")
def create_sector(sector: SectorCreate, db: Session = Depends(get_db)):
    if db.query(Sector).filter(Sector.name == sector.name).first():
        raise HTTPException(status_code=400, detail="Sector already exists")
    
    db_sector = Sector(name=sector.name, description=sector.description)
    db.add(db_sector)
    db.commit()
    db.refresh(db_sector)
    
    log_action(db, 1, "create_sector", "sector", db_sector.id, f"Created sector: {sector.name}")
    
    return {"message": "Sector created successfully", "sector_id": db_sector.id}

@router.delete("/sectors/{sector_id}")
def delete_sector(sector_id: int, db: Session = Depends(get_db)):
    sector = db.query(Sector).filter(Sector.id == sector_id).first()
    if not sector:
        raise HTTPException(status_code=404, detail="Sector not found")
    
    log_action(db, 1, "delete_sector", "sector", sector_id, f"Deleted sector: {sector.name}")
    db.delete(sector)
    db.commit()
    
    return {"message": "Sector deleted successfully"}

# System-wide Analytics
@router.get("/analytics/overview")
def get_system_overview(db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    total_budgets = db.query(func.count(Budget.id)).scalar()
    total_budget_amount = db.query(func.sum(Budget.amount)).scalar() or 0
    total_feedback = db.query(func.count(Feedback.id)).scalar()
    total_forum_posts = db.query(func.count(ForumPost.id)).scalar()
    flagged_posts = db.query(func.count(ForumPost.id)).filter(ForumPost.is_flagged == True).scalar()
    
    return {
        "total_users": total_users,
        "total_budgets": total_budgets,
        "total_budget_amount": total_budget_amount,
        "total_feedback": total_feedback,
        "total_forum_posts": total_forum_posts,
        "flagged_posts": flagged_posts,
        "active_users": db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    }

@router.get("/analytics/by-sector")
def get_analytics_by_sector(db: Session = Depends(get_db), admin: User = Depends(require_super_admin)):
    sectors = db.query(Sector).all()
    result = []
    
    for sector in sectors:
        budgets = db.query(Budget).filter(Budget.sector_id == sector.id).all()
        total_budget = sum(b.amount for b in budgets)
        feedback_count = db.query(func.count(Feedback.id)).filter(Feedback.sector_id == sector.id).scalar()
        
        result.append({
            "sector_name": sector.name,
            "total_budget": total_budget,
            "budget_count": len(budgets),
            "feedback_count": feedback_count
        })
    
    return result

# Audit Logs
@router.get("/audit-logs")
def get_audit_logs(limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    
    result = []
    for log in logs:
        user = db.query(User).filter(User.id == log.user_id).first()
        result.append({
            "id": log.id,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "created_at": log.created_at
        })
    
    return result

# Forum Moderation Override
@router.get("/forum/flagged-content")
def get_all_flagged_content(db: Session = Depends(get_db)):
    flagged_posts = db.query(ForumPost).filter(ForumPost.is_flagged == True).all()
    flagged_replies = db.query(ForumReply).filter(ForumReply.is_flagged == True).all()
    
    posts_data = []
    for post in flagged_posts:
        user = db.query(User).filter(User.id == post.user_id).first()
        posts_data.append({
            "type": "post",
            "id": post.id,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "title": post.title,
            "content": post.content,
            "flagged_reason": post.flagged_reason,
            "moderation_status": post.moderation_status.value if post.moderation_status else "pending",
            "created_at": post.created_at
        })
    
    replies_data = []
    for reply in flagged_replies:
        user = db.query(User).filter(User.id == reply.user_id).first()
        post = db.query(ForumPost).filter(ForumPost.id == reply.post_id).first()
        replies_data.append({
            "type": "reply",
            "id": reply.id,
            "post_title": post.title if post else "Unknown",
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "content": reply.content,
            "flagged_reason": reply.flagged_reason,
            "moderation_status": reply.moderation_status.value if reply.moderation_status else "pending",
            "created_at": reply.created_at
        })
    
    return {"posts": posts_data, "replies": replies_data}

# Budget Management (All Sectors)
class BudgetCreate(BaseModel):
    sector_id: int
    year: int
    amount: float
    description: str

@router.post("/budgets")
def create_budget(budget: BudgetCreate, db: Session = Depends(get_db)):
    db_budget = Budget(**budget.dict())
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    
    log_action(db, 1, "create_budget", "budget", db_budget.id, f"Created budget for sector {budget.sector_id}")
    
    return {"message": "Budget created successfully", "budget_id": db_budget.id}

@router.delete("/budgets/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    log_action(db, 1, "delete_budget", "budget", budget_id, f"Deleted budget")
    db.delete(budget)
    db.commit()
    
    return {"message": "Budget deleted successfully"}

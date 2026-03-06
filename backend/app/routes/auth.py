from fastapi import APIRouter, HTTPException, Depends, Form
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserRead
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token, verify_token
from app.db.session import SessionLocal
from pydantic import BaseModel, EmailStr
import secrets
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserRead)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login")
def login(email: str = Form(), password: str = Form(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value, "name": user.name})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserRead)
def get_current_user(token_data: dict = Depends(verify_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == int(token_data["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Password Reset
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str

class AdminResetPasswordRequest(BaseModel):
    user_id: int
    new_password: str

# Temporary storage for reset codes (in production, use Redis or database)
reset_codes = {}

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Don't reveal if email exists for security
        return {"message": "If the email exists, a reset code has been sent"}
    
    # Generate 6-digit code
    reset_code = str(secrets.randbelow(900000) + 100000)
    
    # Store code with expiration (10 minutes)
    reset_codes[request.email] = {
        "code": reset_code,
        "expires": datetime.now() + timedelta(minutes=10)
    }
    
    # In production, send email here
    # For now, return code in response (ONLY FOR DEVELOPMENT)
    print(f"Reset code for {request.email}: {reset_code}")
    
    return {
        "message": "If the email exists, a reset code has been sent",
        "reset_code": reset_code  # Remove this in production
    }

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    # Check if code exists and is valid
    if request.email not in reset_codes:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")
    
    stored_data = reset_codes[request.email]
    
    # Check expiration
    if datetime.now() > stored_data["expires"]:
        del reset_codes[request.email]
        raise HTTPException(status_code=400, detail="Reset code has expired")
    
    # Verify code
    if stored_data["code"] != request.reset_code:
        raise HTTPException(status_code=400, detail="Invalid reset code")
    
    # Update password
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = hash_password(request.new_password)
    db.commit()
    
    # Remove used code
    del reset_codes[request.email]
    
    return {"message": "Password reset successfully"}

@router.post("/admin/reset-user-password")
def admin_reset_user_password(request: AdminResetPasswordRequest, token_data: dict = Depends(verify_token), db: Session = Depends(get_db)):
    # Verify admin/super_admin role
    if token_data.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get user
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update password
    user.hashed_password = hash_password(request.new_password)
    db.commit()
    
    return {"message": f"Password reset successfully for {user.email}"}
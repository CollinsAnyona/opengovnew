from pydantic import BaseModel, EmailStr
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    citizen = "citizen"
    admin = "admin"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.citizen

class UserRead(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime
    
    class Config:
        from_attributes = True
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ForumReplyCreate(BaseModel):
    content: str

class ForumReplyUpdate(BaseModel):
    content: str

class ForumReplyRead(BaseModel):
    id: int
    post_id: int
    user_id: int
    content: str
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

class ForumPostCreate(BaseModel):
    title: str
    content: str
    category: str
    sector_id: Optional[int] = None

class ForumPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

class ForumPostRead(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    category: str
    sector_id: Optional[int] = None
    sector_name: Optional[str] = None
    created_at: datetime
    user_name: Optional[str] = None
    reply_count: Optional[int] = 0

    class Config:
        from_attributes = True

class ForumPostDetail(ForumPostRead):
    replies: List[ForumReplyRead] = []

    class Config:
        from_attributes = True

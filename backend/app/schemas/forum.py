from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ForumReplyCreate(BaseModel):
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

class ForumPostRead(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    category: str
    created_at: datetime
    user_name: Optional[str] = None
    reply_count: Optional[int] = 0

    class Config:
        from_attributes = True

class ForumPostDetail(ForumPostRead):
    replies: List[ForumReplyRead] = []

    class Config:
        from_attributes = True

from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, Boolean, String, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..db.base import Base

class ModerationStatus(enum.Enum):
    pending = "pending"
    approved = "approved"
    warned = "warned"
    removed = "removed"
    suspended = "suspended"

class ForumReply(Base):
    __tablename__ = "forum_replies"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("forum_posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_flagged = Column(Boolean, default=False)
    flagged_reason = Column(String, nullable=True)
    moderation_status = Column(Enum(ModerationStatus), default=ModerationStatus.approved)
    admin_action = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    post = relationship("ForumPost", back_populates="replies")
    user = relationship("User")

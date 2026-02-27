from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..db.base import Base

class ModerationStatus(enum.Enum):
    pending = "pending"  # AI flagged, awaiting admin review
    approved = "approved"  # Admin reviewed and approved
    warned = "warned"  # Admin sent warning to user
    removed = "removed"  # Admin removed the content
    suspended = "suspended"  # User suspended for this content

class ForumPost(Base):
    __tablename__ = "forum_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    is_flagged = Column(Boolean, default=False)
    flagged_reason = Column(String(200), nullable=True)
    moderation_status = Column(Enum(ModerationStatus), default=ModerationStatus.approved)
    admin_action = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="forum_posts")
    replies = relationship("ForumReply", back_populates="post", cascade="all, delete-orphan")

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base
from app.models import user, sector  # Import to ensure models are registered

class FeedbackStatus(enum.Enum):
    submitted = "submitted"
    flagged = "flagged"
    approved = "approved"
    under_review = "under_review"
    escalated = "escalated"

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sector_id = Column(Integer, ForeignKey("sectors.id"), nullable=False)
    message = Column(String, nullable=False)
    status = Column(Enum(FeedbackStatus), default=FeedbackStatus.submitted)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
    sector = relationship("Sector", back_populates="feedback")
    ai_analysis = relationship("AIAnalysis", back_populates="feedback", uselist=False)
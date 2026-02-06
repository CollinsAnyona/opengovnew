from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..db.base import Base

class Sector(Base):
    __tablename__ = "sectors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    
    # Relationships (will be defined when budget/feedback models are created)
    budgets = relationship("Budget", back_populates="sector")
    feedback = relationship("Feedback", back_populates="sector")
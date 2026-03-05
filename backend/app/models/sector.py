from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class Sector(Base):
    __tablename__ = "sectors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    
    budgets = relationship("Budget", back_populates="sector", lazy="dynamic")
    feedback = relationship("Feedback", back_populates="sector", lazy="dynamic")
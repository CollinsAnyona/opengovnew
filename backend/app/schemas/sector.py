from pydantic import BaseModel

class SectorBase(BaseModel):
    name: str

class SectorCreate(SectorBase):
    pass

class SectorRead(SectorBase):
    id: int
    
    class Config:
        from_attributes = True
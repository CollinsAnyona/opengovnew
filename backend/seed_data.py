from app.db.session import SessionLocal
from app.models.sector import Sector

def seed_sectors():
    db = SessionLocal()
    try:
        # Check if sectors already exist
        if db.query(Sector).count() == 0:
            sectors = [
                Sector(name="education"),
                Sector(name="health")
            ]
            db.add_all(sectors)
            db.commit()
            print("Sectors created successfully")
        else:
            print("Sectors already exist")
    finally:
        db.close()

if __name__ == "__main__":
    seed_sectors()
import sys
import os
sys.path.append('backend')

from app.db.session import SessionLocal
from app.models.budget import Budget
from sqlalchemy import func

def test_db():
    db = SessionLocal()
    try:
        total_budget = db.query(func.sum(Budget.amount)).scalar() or 0
        print(f"Total budget: {total_budget}")
        return True
    except Exception as e:
        print(f"Database error: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    test_db()
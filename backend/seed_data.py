from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.sector import Sector
from app.models.budget import Budget
from app.models.expenditure import Expenditure
from app.models.feedback import Feedback
from app.models.ai_analysis import AIAnalysis
from app.core.security import hash_password

def seed_data():
    db = SessionLocal()
    try:
        # Seed Sectors
        if db.query(Sector).count() == 0:
            sectors = [
                Sector(name="education"),
                Sector(name="health")
            ]
            db.add_all(sectors)
            db.commit()
            print("Sectors created successfully")
        
        # Seed Users
        if db.query(User).count() == 0:
            users = [
                User(
                    name="Admin User",
                    email="admin@opengov.ke",
                    hashed_password=hash_password("admin123"),
                    role=UserRole.admin
                ),
                User(
                    name="John Citizen",
                    email="citizen@opengov.ke",
                    hashed_password=hash_password("citizen123"),
                    role=UserRole.citizen
                )
            ]
            db.add_all(users)
            db.commit()
            print("Users created successfully")
        
        # Seed Budgets
        if db.query(Budget).count() == 0:
            education_sector = db.query(Sector).filter(Sector.name == "education").first()
            health_sector = db.query(Sector).filter(Sector.name == "health").first()
            
            budgets = [
                Budget(sector_id=education_sector.id, year=2023, amount=50000000, description="Primary and secondary school infrastructure"),
                Budget(sector_id=education_sector.id, year=2024, amount=75000000, description="Teacher training and curriculum development"),
                Budget(sector_id=health_sector.id, year=2023, amount=40000000, description="Hospital equipment and supplies"),
                Budget(sector_id=health_sector.id, year=2024, amount=60000000, description="Community health programs and vaccination")
            ]
            db.add_all(budgets)
            db.commit()
            print("Budgets created successfully")
            
            # Seed Expenditures
            education_budget_2023 = db.query(Budget).filter(
                Budget.sector_id == education_sector.id,
                Budget.year == 2023
            ).first()
            
            expenditures = [
                Expenditure(budget_id=education_budget_2023.id, amount=15000000, description="Construction of 10 new classrooms"),
                Expenditure(budget_id=education_budget_2023.id, amount=8000000, description="Purchase of desks and chairs"),
                Expenditure(budget_id=education_budget_2023.id, amount=5000000, description="Library books and learning materials")
            ]
            db.add_all(expenditures)
            db.commit()
            print("Expenditures created successfully")
        
        print("\nDatabase seeded successfully!")
        print("\nTest Accounts:")
        print("Admin: admin@opengov.ke / admin123")
        print("Citizen: citizen@opengov.ke / citizen123")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
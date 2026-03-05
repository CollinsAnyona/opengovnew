from app.db.session import SessionLocal
from app.models.budget import Budget
from app.models.sector import Sector

db = SessionLocal()

# Check if county data exists
print("=== Checking County Data ===")
budgets = db.query(Budget).limit(5).all()
for b in budgets:
    print(f"ID: {b.id}, Sector: {b.sector_id}, Year: {b.year}, County: {b.county}, Desc: {b.description[:50]}")

# Check sector filtering
print("\n=== Testing Sector Filter ===")
education_sector = db.query(Sector).filter(Sector.name.ilike("Education")).first()
if education_sector:
    print(f"Found sector: {education_sector.name} (ID: {education_sector.id})")
    education_budgets = db.query(Budget).filter(Budget.sector_id == education_sector.id).limit(3).all()
    print(f"Education budgets count: {len(education_budgets)}")
    for b in education_budgets:
        print(f"  - Year: {b.year}, County: {b.county}, Amount: {b.amount}")
else:
    print("Education sector not found!")

# Check county filtering
print("\n=== Testing County Filter ===")
baringo_budgets = db.query(Budget).filter(Budget.county.ilike("Baringo")).limit(3).all()
print(f"Baringo budgets count: {len(baringo_budgets)}")
for b in baringo_budgets:
    print(f"  - Sector: {b.sector_id}, Year: {b.year}, County: {b.county}")

db.close()
print("\n=== Test Complete ===")

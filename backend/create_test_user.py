from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

def create_test_user():
    db = SessionLocal()
    try:
        # Check if test user already exists
        existing_user = db.query(User).filter(User.email == "test@opengov.ke").first()
        if existing_user:
            print(f"Test user already exists: {existing_user.email}")
            return
        
        # Create test citizen user
        test_user = User(
            name="Test Citizen",
            email="test@opengov.ke",
            hashed_password=hash_password("test123"),
            role=UserRole.citizen,
            is_active=True
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print("Test user created successfully!")
        print(f"Email: {test_user.email}")
        print(f"Password: test123")
        print(f"Role: {test_user.role}")
        
    except Exception as e:
        print(f"Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()

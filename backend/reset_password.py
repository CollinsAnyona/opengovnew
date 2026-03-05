from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

def reset_super_admin_password():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "collins@opengov.ke").first()
        if not user:
            print("Super admin not found!")
            return
        
        new_password = "Collins.anyona04"
        user.hashed_password = hash_password(new_password)
        db.commit()
        
        print("Password reset successfully!")
        print(f"Email: {user.email}")
        print(f"New Password: {new_password}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_super_admin_password()

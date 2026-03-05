from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

def create_super_admin():
    db = SessionLocal()
    try:
        # Check if super admin already exists
        existing_super_admin = db.query(User).filter(User.role == UserRole.super_admin).first()
        if existing_super_admin:
            print(f"Super admin already exists: {existing_super_admin.email}")
            return
        
        # Create super admin
        super_admin = User(
            name="Super Administrator",
            email="collins@opengov.ke",
            hashed_password=hash_password("Collins.anyona04"),
            role=UserRole.super_admin,
            is_active=True
        )
        
        db.add(super_admin)
        db.commit()
        db.refresh(super_admin)
        
        print("✓ Super admin created successfully!")
        print(f"Email: {super_admin.email}")
        print(f"Password: Collins.anyona04")
        print("\nIMPORTANT: Change this password immediately after first login!")
        
    except Exception as e:
        print(f"Error creating super admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()

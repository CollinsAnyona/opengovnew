# OpenGov - Government Transparency Platform

A modern web application for transparent government financial management and citizen engagement.

## Features

- **Dashboard**: Real-time budget tracking and expenditure monitoring
- **AI-Powered Insights**: Automated analysis of spending patterns and citizen feedback
- **Citizen Feedback**: Submit and track feedback on government services
- **Admin Panel**: Moderate citizen submissions with AI assistance
- **Content Moderation**: AI-powered forum moderation with email notifications
- **Super Admin**: Complete system management and oversight
- **Forum**: Community discussions on governance issues with edit/delete functionality
- **Email Notifications**: Automated emails for forum replies, moderation actions, and password resets
- **User Management**: Promote users, reset passwords, activate/deactivate accounts

## Tech Stack

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite Database
- JWT Authentication
- AI Integration for content moderation

### Frontend
- React + Vite
- TailwindCSS
- Recharts for data visualization
- React Router

## Installation

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python create_super_admin.py

# Configure email (optional but recommended)
# Copy .env.example to .env and add your SMTP credentials
cp .env.example .env
# Edit .env file with your email settings (see EMAIL_SETUP.md)

uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Default Credentials

**Super Admin:**
- Email: superadmin@opengov.ke
- Password: SuperAdmin@2024

**Important:** Change the password immediately after first login!

## User Roles

- **Citizen**: Submit feedback, view budgets, participate in forums
- **Admin**: Moderate feedback, view analytics
- **Super Admin**: Full system control, user management, budget creation

## API Documentation

Once the backend is running, visit: `http://localhost:8000/docs`

## License

MIT License

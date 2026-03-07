# OpenGov - Government Transparency Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://opengov-frontend.onrender.com)
[![Backend API](https://img.shields.io/badge/API-Docs-blue)](https://opengovnew.onrender.com/docs)
[![Video Demo](https://img.shields.io/badge/Video-Demo-red)](https://drive.google.com/file/d/1bXiCdM_D9eqMhp5sxQbF0FDk0U0SX9KI/view?usp=sharing)

A modern web application for transparent government financial management and citizen engagement built with React, FastAPI, and AI-powered insights.

## Live Deployment

- **Frontend:** https://opengov-frontend.onrender.com
- **Backend API:** https://opengovnew.onrender.com
- **API Documentation:** https://opengovnew.onrender.com/docs

## Demo Video

[5-Minute Demo Video](https://drive.google.com/file/d/1bXiCdM_D9eqMhp5sxQbF0FDk0U0SX9KI/view?usp=sharing) - Showcasing core functionalities

![Screenshot of the System Features](https://github.com/CollinsAnyona/opengovnew/issues/1#issuecomment-4016263414)

## Core Features

### 1. Budget Transparency Dashboard
- Real-time budget tracking across government sectors
- Interactive charts and visualizations (Recharts)
- Expenditure monitoring and analysis
- Year-over-year budget comparisons

### 2. AI-Powered Insights
- Automated analysis of spending patterns using Google Gemini AI
- Sentiment analysis of citizen feedback
- Anomaly detection in expenditures
- AI-powered content moderation for forums

### 3. Citizen Engagement
- Submit feedback on government services
- Track feedback status (New → Under Review → Resolved/Escalated)
- Community forum for governance discussions
- Email notifications for responses and updates

### 4. Admin & Moderation Tools
- AI-assisted feedback moderation
- Forum content moderation with automated flagging
- User management (promote, deactivate, reset passwords)
- Analytics dashboard with insights

### 5. Multi-Role System
- **Citizen**: View budgets, submit feedback, participate in forums
- **Admin**: Moderate content, view analytics, respond to feedback
- **Super Admin**: Full system control, user management, budget creation

## Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.11)
- **Database:** SQLite with SQLAlchemy ORM
- **Authentication:** JWT tokens with bcrypt password hashing
- **AI Integration:** Google Gemini 2.0 Flash
- **Email:** SMTP with HTML templates
- **API Documentation:** Swagger/OpenAPI

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** TailwindCSS 4.2
- **Routing:** React Router 7
- **Charts:** Recharts 3.7
- **HTTP Client:** Axios

## Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/CollinsAnyona/opengovnew.git
cd opengovnew
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create super admin account
python create_super_admin.py

# Configure environment variables (optional)
cp .env.example .env
# Edit .env with your SMTP and Gemini API credentials

# Run backend server
uvicorn main:app --reload
```

Backend will run on: http://localhost:8000

### Step 3: Frontend Setup

```bash
# Open new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on: http://localhost:5173

### Step 4: Access Application

1. Open browser: http://localhost:5173
2. Login with default credentials:
   - **Email:** collins@opengov.ke
   - **Password:** Collins.anyona04

## Testing Strategies

### 1. Functional Testing
- User authentication (login/logout)
- Role-based access control (citizen/admin/super_admin)
- CRUD operations (budgets, feedback, forum posts)
- AI moderation and insights generation
- Email notification delivery

### 2. Integration Testing
- Frontend-Backend API communication
- Database operations (SQLite)
- External API integration (Google Gemini)
- SMTP email service integration

### 3. Performance Testing
- Page load times (<2s on local, ~30s cold start on Render free tier)
- API response times (<500ms for most endpoints)
- Database query optimization
- Frontend bundle size optimization

### 4. Cross-Platform Testing
- Desktop browsers (Chrome, Firefox, Edge, Safari)
- Mobile responsive design (tested on various screen sizes)
- Different OS (Windows, macOS, Linux)

### 5. Security Testing
- JWT token authentication
- Password hashing (bcrypt)
- CORS configuration
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection

## Test Data Values

### Sample Users
- **Super Admin:** collins@opengov.ke / Collins.anyona04
- **Admin:** admin@opengov.ke / admin123
- **Citizen:** citizen@opengov.ke / citizen123

### Sample Data
- **Sectors:** Education, Health, Infrastructure
- **Budgets:** Multiple years (2023-2024) with varying amounts
- **Expenditures:** Detailed spending records per budget
- **Feedback:** Various citizen submissions with different statuses
- **Forum Posts:** Community discussions on governance topics

## Deployment

### Production Deployment (Render)

The application is deployed on Render with:
- **Backend:** Python web service with SQLite database
- **Frontend:** Static site with SPA routing
- **Database:** SQLite file persisted on disk
- **Environment:** Production-ready with CORS, HTTPS, and monitoring

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Performance Metrics

### Local Development
- Backend startup: ~2 seconds
- Frontend build: ~5 seconds
- API response time: <200ms average
- Page load time: <1 second

### Production (Render Free Tier)
- Cold start: ~30 seconds (after 15 min inactivity)
- Warm response: <500ms
- Database queries: <100ms
- Frontend CDN delivery: <2 seconds

## Project Objectives Achievement

### Achieved Objectives
1. **Budget Transparency:** Real-time visualization of government budgets
2. **Citizen Engagement:** Feedback system with status tracking
3. **AI Integration:** Automated content moderation and insights
4. **Multi-Role System:** Citizen, Admin, Super Admin with proper permissions
5. **Email Notifications:** Automated alerts for user actions
6. **Forum Discussions:** Community engagement platform
7. **Responsive Design:** Mobile-friendly interface
8. **Production Deployment:** Live on Render with HTTPS

### Future Enhancements
1. **Mobile App:** Native iOS/Android applications
2. **Advanced Analytics:** Predictive budget forecasting
3. **Multi-Language:** Support for local languages
4. **Document Upload:** PDF reports and receipts
5. **Real-time Chat:** Live support for citizens
6. **Data Export:** CSV/Excel export functionality
7. **Advanced Search:** Full-text search across all content
8. **Audit Trail:** Comprehensive logging system

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user

### Budgets
- `GET /budgets` - List all budgets
- `POST /budgets` - Create budget (admin)
- `GET /budgets/{id}` - Get budget details

### Feedback
- `GET /feedback` - List feedback
- `POST /feedback` - Submit feedback
- `POST /feedback/{id}/respond` - Admin response
- `PATCH /feedback/{id}/status` - Update status

### Forum
- `GET /forum/posts` - List posts
- `POST /forum/posts` - Create post
- `POST /forum/posts/{id}/replies` - Add reply
- `DELETE /forum/admin/posts/{id}` - Delete post (admin)

### AI Insights
- `POST /ai/moderate` - Content moderation
- `POST /ai/analyze-feedback` - Feedback analysis
- `GET /ai/budget-insights` - Budget insights

Full API documentation: https://opengovnew.onrender.com/docs

## Contributing

This is a capstone project. For inquiries, contact the development team.

## License

MIT License - See LICENSE file for details

## Team

- **Developer:** Collins Anyona
- **Institution:** African Leadership University
- **Course:** Capstone Project 2026
- **Supervisor:** Pelin Mutanguha

## Support

For issues or questions:
- GitHub Issues: https://github.com/CollinsAnyona/opengovnew/issues
- Email: cjotieno04@gmail.com

---

**Note:** This application is a demonstration project for educational purposes. For production use in actual government systems, additional security audits, compliance checks, and infrastructure scaling would be required.

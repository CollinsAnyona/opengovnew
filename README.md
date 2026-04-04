# OpenGov - Government Transparency Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://opengov-frontend.onrender.com)
[![Backend API](https://img.shields.io/badge/API-Docs-blue)](https://opengovnew.onrender.com/docs)
[![Video Demo](https://img.shields.io/badge/Video-Demo-red)](https://drive.google.com/file/d/1bXiCdM_D9eqMhp5sxQbF0FDk0U0SX9KI/view?usp=sharing)

A modern web application for transparent government financial management and citizen engagement, built with React, FastAPI, and AI-powered insights.

---

## Live Deployment

| Service | URL |
|---|---|
| Frontend | https://opengov-frontend.onrender.com |
| Backend API | https://opengovnew.onrender.com |
| API Documentation | https://opengovnew.onrender.com/docs |

> **Note:** The app is hosted on Render's free tier. Expect a ~30 second cold start after 15 minutes of inactivity.

---

## Demo Video

[5-Minute Demo Video](https://drive.google.com/file/d/1bXiCdM_D9eqMhp5sxQbF0FDk0U0SX9KI/view?usp=sharing)

---

## Core Features

### 1. Budget Transparency Dashboard
- Real-time budget tracking across government sectors
- Interactive charts and visualizations (Recharts)
- Expenditure monitoring and year-over-year comparisons
- AI-generated citizen-friendly explanations for each budget entry

### 2. AI-Powered Insights (Google Gemini)
- Automated analysis of spending patterns
- Sentiment analysis of citizen feedback
- Anomaly detection in expenditures
- AI content moderation for forum posts and replies before storage
- Retry logic with fallback for API rate limits

### 3. Citizen Engagement
- Submit feedback on government services
- Track feedback status: `Submitted → Under Review → Resolved / Escalated`
- Community forum with edit and delete on own posts and replies
- Email notifications triggered on every admin action

### 4. Admin & Moderation Tools
- AI-assisted feedback moderation with personalized responses
- Forum content moderation with automated flagging
- User management: promote, deactivate, reset passwords
- Analytics dashboard with sector-level insights

### 5. Multi-Role System
| Role | Permissions |
|---|---|
| Citizen | View budgets, submit feedback, participate in forums |
| Admin | Moderate content, view analytics, respond to feedback |
| Super Admin | Full system control, user management, budget and sector creation |

### 6. Legal & Privacy Pages
- Privacy Policy (`/privacy-policy`) — data collection, AI moderation disclosure, user rights
- Terms & Conditions (`/terms`) — acceptable use, platform limitations, liability

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| FastAPI (Python 3.10+) | REST API framework |
| SQLite + SQLAlchemy ORM | Database and ORM |
| JWT + bcrypt | Authentication and password hashing |
| Google Gemini 2.0 Flash Lite | AI moderation and insights |
| Gmail SMTP | Email notifications |
| Swagger / OpenAPI | Auto-generated API docs |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework and build tool |
| TailwindCSS 4.2 | Styling |
| React Router 7 | Client-side routing |
| Recharts 3.7 | Budget visualizations |
| Axios | HTTP client |

---

## Prerequisites

Before setting up the project, ensure you have:

- Python 3.10 or higher — https://www.python.org/downloads/
- Node.js 18 or higher — https://nodejs.org/
- Git — https://git-scm.com/
- A Google account with 2-Step Verification enabled (for Gmail SMTP)
- A Google Gemini API key — https://aistudio.google.com/app/apikey

---

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/CollinsAnyona/opengovnew.git
cd opengovnew
```

---

### Step 2: Backend Setup

```bash
cd backend
```

**Create and activate a virtual environment:**

```bash
# Create virtual environment
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate
```

**Install dependencies:**

```bash
pip install -r requirements.txt
```

**Configure environment variables:**

```bash
# Copy the example env file
cp .env.example .env
```

Open `.env` and fill in all values:

```env
# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# Email (Gmail SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-gmail@gmail.com
SMTP_PASSWORD=your-16-character-app-password
FROM_EMAIL=your-gmail@gmail.com

# Database
DATABASE_URL=sqlite:///./opengov.db

# JWT Secret — generate with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your-generated-secret-key
```

> See the **Environment Variables Guide** section below for how to obtain each value.

**Create the super admin account:**

```bash
python create_super_admin.py
```

**Start the backend server:**

```bash
uvicorn main:app --reload
```

Backend runs on: http://localhost:8000
API docs available at: http://localhost:8000/docs

---

### Step 3: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

---

### Step 4: Access the Application

Open http://localhost:5173 in your browser.

**Default login credentials:**

| Role | Email | Password |
|---|---|---|
| Super Admin | collins@opengov.ke | Collins.anyona04 |
| Admin | c.junior@alustudent.com | *(set during creation)* |

> It is strongly recommended to change default passwords before any public or production use.

---

## Environment Variables Guide

### GEMINI_API_KEY
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **Create API Key**
4. Create it under a **new Google Cloud project** to get a fresh free-tier quota
5. Copy the key into `.env`

> **Security:** Never commit your `.env` file. It is already listed in `.gitignore`. If a key is accidentally pushed, revoke it immediately at https://aistudio.google.com/app/apikey and generate a new one.

### SMTP_PASSWORD (Gmail App Password)
1. Go to https://myaccount.google.com/security
2. Ensure **2-Step Verification** is turned ON
3. Go to https://myaccount.google.com/apppasswords
4. Create a new app password with the name `OpenGov`
5. Copy the 16-character password (remove spaces) into `.env` as `SMTP_PASSWORD`

> **Security:** App passwords bypass 2FA. Treat them like your account password. Never share or commit them.

### SECRET_KEY
Generate a cryptographically secure key:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Paste the output into `.env` as `SECRET_KEY`. This key signs all JWT tokens — changing it will invalidate all active sessions.

---

## Security Practices

This project follows these security practices:

| Practice | Implementation |
|---|---|
| Password hashing | bcrypt via passlib |
| Authentication | JWT tokens with expiry |
| Secret management | All secrets in `.env`, never committed |
| `.gitignore` | `.env` and `opengov.db` excluded from version control |
| SQL injection prevention | SQLAlchemy ORM parameterized queries |
| CORS | Configured to allow only known frontend origins |
| AI content moderation | All user content moderated by Gemini before storage |
| Input validation | Pydantic schemas on all API endpoints |
| Role-based access control | Citizen / Admin / Super Admin enforced on every route |

### What to do if a secret is leaked

1. **Gemini API Key** — Revoke immediately at https://aistudio.google.com/app/apikey, generate a new one under a new project
2. **Gmail App Password** — Delete it at https://myaccount.google.com/apppasswords, generate a new one
3. **SECRET_KEY** — Generate a new one and restart the backend (all users will need to log in again)
4. **Remove from git history:**

```bash
git rm --cached backend/.env
git commit -m "Remove .env from tracking"
git push
```

---

## Privacy

OpenGov handles user data in accordance with its Privacy Policy (`/privacy-policy`):

- Collects only name and email for account registration
- Feedback is processed separately from identifiable information where possible
- All data is stored in a secured SQLite database with restricted admin access
- AI moderation is applied to all user-generated content before storage
- Users may request access to, update, or deletion of their data by contacting the administrator
- No data is sold or shared with third parties

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| GET | `/auth/me` | Get current user |

### Budgets
| Method | Endpoint | Description |
|---|---|---|
| GET | `/budgets` | List all budgets |
| POST | `/budgets` | Create budget (super admin) |
| GET | `/budgets/{id}` | Get budget details |

### Feedback
| Method | Endpoint | Description |
|---|---|---|
| GET | `/feedback` | List feedback |
| POST | `/feedback` | Submit feedback |
| PUT | `/feedback/{id}` | Update feedback status (admin) |
| POST | `/feedback/{id}/respond` | Admin response |

### Forum
| Method | Endpoint | Description |
|---|---|---|
| GET | `/forum/posts` | List posts |
| POST | `/forum/posts` | Create post |
| PUT | `/forum/posts/{id}` | Edit own post |
| DELETE | `/forum/posts/{id}` | Delete own post |
| POST | `/forum/posts/{id}/replies` | Add reply |
| PUT | `/forum/posts/{id}/replies/{rid}` | Edit own reply |
| DELETE | `/forum/posts/{id}/replies/{rid}` | Delete own reply |
| DELETE | `/forum/admin/posts/{id}` | Admin delete any post |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/moderate` | Content moderation |
| POST | `/ai/analyze-feedback` | Feedback analysis |
| GET | `/ai/budget-insights` | Budget insights |
| POST | `/ai-assistant/chat` | AI chat assistant |
| GET | `/ai-assistant/suggestions` | Suggested questions |

Full interactive docs: https://opengovnew.onrender.com/docs

---

## Troubleshooting

**Gemini AI returns fallback messages**
- Check your API key is valid and not revoked
- The free tier has rate limits — the app retries automatically, wait a few seconds and try again
- If `limit: 0` appears in logs, your project quota is exhausted — create a new Google Cloud project and generate a fresh key

**Emails not sending**
- Confirm 2-Step Verification is enabled on your Gmail account
- Ensure you are using an App Password, not your regular Gmail password
- App passwords are invalidated if 2FA is turned off — regenerate if needed

**Backend won't start**
- Ensure your virtual environment is activated before running `uvicorn`
- Run `pip install -r requirements.txt` again if you see `ModuleNotFoundError`

**Forum Edit/Delete buttons not showing**
- Ensure you are logged in and viewing your own post or reply
- Clear browser localStorage and log in again if the issue persists

---

## Project Structure

```
opengovnew/
├── backend/
│   ├── app/
│   │   ├── core/          # Security, config
│   │   ├── db/            # Database session and base
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routes/        # API route handlers
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Gemini AI, email, analytics
│   ├── .env               # Secret config (never committed)
│   ├── .env.example       # Template for .env
│   ├── main.py            # FastAPI app entry point
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── api/           # Axios client
│   │   ├── auth/          # Route guards
│   │   ├── components/    # Shared components (Layout, Navigation)
│   │   ├── pages/         # All page components
│   │   └── theme/         # Colors and typography
│   └── package.json
├── .gitignore
└── README.md
```

---

## Performance Metrics

| Environment | Metric | Value |
|---|---|---|
| Local | Backend startup | ~2 seconds |
| Local | API response time | <200ms average |
| Local | Page load time | <1 second |
| Production | Cold start | ~30 seconds |
| Production | Warm response | <500ms |
| Production | Database queries | <100ms |

---

## Future Enhancements

1. Mobile App — Native iOS/Android
2. Advanced Analytics — Predictive budget forecasting
3. Multi-Language — Swahili and other local languages
4. Document Upload — PDF reports and receipts
5. Data Export — CSV/Excel functionality
6. Advanced Search — Full-text search across all content
7. Audit Trail — Comprehensive admin action logging
8. Real-time Notifications — WebSocket-based alerts

---

## Team

| | |
|---|---|
| Developer | Collins Otieno Junior |
| Institution | African Leadership University |
| Course | Capstone Project 2026 |
| Supervisor | Pelin Mutanguha |
| Contact | cjotieno04@gmail.com |

---

## License

MIT License — See LICENSE file for details.

---

> **Disclaimer:** This application is a demonstration project for educational purposes. For deployment in actual government systems, additional security audits, legal compliance reviews, and infrastructure scaling would be required.

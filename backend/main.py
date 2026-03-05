from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.budgets import router as budget_router
from app.routes.feedback import router as feedback_router
from app.routes.ai import router as ai_router
from app.routes.ai_insights import router as ai_insights_router
from app.routes.sectors import router as sectors_router
from app.routes.expenditures import router as expenditures_router
from app.routes.forum import router as forum_router
from app.routes.super_admin import router as super_admin_router
from app.db.session import engine
from app.db.base import Base
from app.models import user, sector, budget, expenditure, feedback, forum_post, forum_reply, user_notification, audit_log

Base.metadata.create_all(bind=engine)

app = FastAPI(title="OpenGov")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(budget_router)
app.include_router(feedback_router)
app.include_router(ai_router)
app.include_router(ai_insights_router)
app.include_router(sectors_router)
app.include_router(expenditures_router)
app.include_router(forum_router)
app.include_router(super_admin_router)

@app.get("/")
def health_check():
    return {"status": "healthy"}
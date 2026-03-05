from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import SessionLocal
from app.services.gemini_service import GeminiAIService
from app.models.budget import Budget
from app.models.expenditure import Expenditure
from app.models.sector import Sector
from app.models.feedback import Feedback
from sqlalchemy import func

router = APIRouter(prefix="/ai-assistant", tags=["ai-assistant"])

class ChatMessage(BaseModel):
    message: str
    sector_id: int = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/chat")
def chat_with_ai(chat: ChatMessage, db: Session = Depends(get_db)):
    """Interactive AI assistant for budget questions"""
    
    try:
        from sqlalchemy import text
        
        # Get comprehensive data from database
        budget_result = db.execute(text("SELECT SUM(amount) FROM budgets")).scalar() or 0
        expenditure_result = db.execute(text("SELECT SUM(amount) FROM expenditures")).scalar() or 0
        
        # Get sector data
        sector_data = db.execute(text("""
            SELECT s.name, SUM(b.amount) as budget_total 
            FROM sectors s 
            JOIN budgets b ON s.id = b.sector_id 
            GROUP BY s.name 
            ORDER BY budget_total DESC 
            LIMIT 5
        """)).fetchall()
        
        # Get feedback trends
        feedback_data = db.execute(text("""
            SELECT s.name, COUNT(f.id) as feedback_count 
            FROM sectors s 
            LEFT JOIN feedback f ON s.id = f.sector_id 
            GROUP BY s.name 
            ORDER BY feedback_count DESC 
            LIMIT 3
        """)).fetchall()
        
        # Build context for Gemini
        top_sectors_text = "\n".join([f"- {row[0]}: KSh {row[1]:,.0f}" for row in sector_data])
        feedback_trends = "\n".join([f"- {row[0]}: {row[1]} feedback items" for row in feedback_data])
        
        utilization_rate = (expenditure_result/budget_result*100) if budget_result > 0 else 0
        
        # Create comprehensive prompt for Gemini
        prompt = f"""You are an AI assistant for Kenya's OpenGov transparency platform. Have a natural conversation with this citizen.

CITIZEN QUESTION: "{chat.message}"

CONTEXT DATA (use only when relevant):
- Total Budget: KSh {budget_result:,.0f}
- Total Spent: KSh {expenditure_result:,.0f}
- Utilization: {utilization_rate:.1f}%

TOP SECTORS:
{top_sectors_text}

FEEDBACK TRENDS:
{feedback_trends}

GUIDELINES:
1. Be conversational and natural - not robotic or formal
2. Only mention budget data if the question is actually about finances/budgets
3. For casual questions (greetings, how are you, etc.), respond naturally without forcing budget info
4. Vary your responses - don't always use the same structure
5. Use simple Swahili greetings occasionally but don't overdo it
6. Keep responses under 150 words unless detailed analysis is needed
7. Be helpful and friendly, like talking to a neighbor
8. If asked about non-budget topics, answer helpfully then gently mention you specialize in government transparency

Respond naturally to their question."""
        
        # Use Gemini AI to generate response
        model = GeminiAIService._get_model()
        if not model:
            # Fallback response if Gemini is unavailable
            if "budget" in chat.message.lower() or "spending" in chat.message.lower() or "money" in chat.message.lower():
                ai_response = f"I can help with budget questions! Kenya's total budget is KSh {budget_result:,.0f} with {utilization_rate:.1f}% utilization. What specific area interests you?"
            else:
                ai_response = f"Hello! I'm here to help with government transparency questions. Feel free to ask about budgets, spending, or any other topic. How can I assist you today?"
        else:
            try:
                response = model.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=[prompt]
                )
                ai_response = response.text
            except Exception as e:
                print(f"Gemini API error: {e}")
                import traceback
                traceback.print_exc()
                ai_response = f"Based on our database, Kenya's total budget is KSh {budget_result:,.0f} with {utilization_rate:.1f}% utilization. I'm having trouble with detailed analysis right now."
        
        # Check user's original question only (not AI response)
        user_question = chat.message.lower().strip()
        
        # Simple greetings that shouldn't show data
        simple_greetings = ['hello', 'hi', 'hey', 'jambo', 'habari', 'how are you', 'good morning', 'good afternoon', 'good evening']
        is_simple_greeting = user_question in simple_greetings
        
        # Budget-specific questions
        budget_keywords = ['budget', 'spend', 'money', 'cost', 'expenditure', 'allocation', 'finance', 'amount', 'utilization']
        has_budget_keyword = any(word in user_question for word in budget_keywords)
        
        show_data = has_budget_keyword and not is_simple_greeting
        
        return {
            "response": ai_response,
            "context_used": True,
            "data_summary": {
                "total_budget": float(budget_result),
                "total_spent": float(expenditure_result),
                "utilization_rate": round(utilization_rate, 1)
            } if show_data else None
        }
    except Exception as e:
        print(f"AI chat error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "response": "I'm having trouble processing your question right now. Please try again.",
            "context_used": False
        }

@router.get("/suggestions")
def get_question_suggestions(db: Session = Depends(get_db)):
    """Get suggested questions citizens can ask"""
    
    # Get dynamic suggestions based on data
    sectors = db.query(Sector).limit(3).all()
    sector_names = [s.name for s in sectors]
    
    suggestions = [
        "How is the government spending money this year?",
        "Which sector has the highest budget?",
        "What percentage of the budget has been spent so far?",
        "Are there any concerns with current spending patterns?",
        f"Tell me about {sector_names[0] if sector_names else 'education'} sector spending",
        "What do citizens think about government spending?",
        "Which sectors need more attention?",
        "How does this year's budget compare to last year?",
        "What are the biggest budget allocations?",
        "Is the government spending efficiently?"
    ]
    
    return {"suggestions": suggestions}

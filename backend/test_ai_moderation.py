from app.db.session import SessionLocal
from app.models.feedback import Feedback
from app.models.ai_analysis import AIAnalysis

db = SessionLocal()

# Check feedback count
feedback_count = db.query(Feedback).count()
print(f"Total feedback: {feedback_count}")

# Check AI analysis count
ai_count = db.query(AIAnalysis).count()
print(f"Total AI analyses: {ai_count}")

# Show all feedback with their AI analysis
feedbacks = db.query(Feedback).all()
for f in feedbacks:
    print(f"\nFeedback ID: {f.id}")
    print(f"Message: {f.message[:50]}...")
    print(f"Status: {f.status.value}")
    
    # Get AI analysis
    analysis = db.query(AIAnalysis).filter(AIAnalysis.feedback_id == f.id).first()
    if analysis:
        print(f"AI Summary: {analysis.summary}")
        print(f"Confidence: {analysis.confidence_score}")
        print(f"Is Clean: {analysis.is_clean}")
    else:
        print("No AI analysis found")

db.close()

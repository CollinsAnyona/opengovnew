from google import genai
from google.genai import types
import os
import json
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None
    print("WARNING: GEMINI_API_KEY not found in environment variables")

MODEL = 'gemini-2.0-flash-lite'

class GeminiAIService:
    """Google Gemini AI service for OpenGov platform"""
    
    @staticmethod
    def _get_model():
        if not client:
            return None
        return client
    
    @staticmethod
    def moderate_content(content: str, content_type: str = "general") -> Dict:
        model = GeminiAIService._get_model()
        if not model:
            return GeminiAIService._basic_moderation(content)
        
        try:
            prompt = f"""Analyze this {content_type} content for moderation in a government transparency platform.

Content: "{content}"

Evaluate for:
1. Hate speech or discrimination
2. Spam or promotional content
3. Misinformation or false claims
4. Personal attacks or harassment
5. Inappropriate language
6. Off-topic content

Respond in JSON format:
{{
    "is_flagged": true/false,
    "reason": "brief explanation if flagged",
    "confidence": 0.0-1.0,
    "category": "hate_speech|spam|misinformation|harassment|inappropriate|off_topic|clean",
    "severity": "low|medium|high"
}}"""
            
            response = model.models.generate_content(model=MODEL, contents=[prompt])
            result = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
            return result
        except Exception as e:
            print(f"Gemini moderation error: {e}")
            return GeminiAIService._basic_moderation(content)
    
    @staticmethod
    def analyze_feedback(feedback_text: str, sector: str, context: Optional[Dict] = None) -> Dict:
        model = GeminiAIService._get_model()
        if not model:
            return {
                "summary": f"Feedback about {sector}",
                "sentiment": "neutral",
                "topics": [sector],
                "priority": "medium",
                "confidence": 0.5,
                "personalized_response": "Thank you for your feedback. We will review it carefully."
            }
        
        try:
            context_info = ""
            if context:
                context_info = f"""

REAL CONTEXT DATA:
- Total Budget for {sector}: KSh {context.get('sector_budget', 0):,.0f}
- Total Spent: KSh {context.get('sector_spent', 0):,.0f}
- Budget Utilization: {context.get('utilization_rate', 0):.1f}%
- Similar Feedback Count: {context.get('similar_feedback_count', 0)}
- Recent Trends: {context.get('trends', 'No data')}
"""
            
            prompt = f"""You are an AI assistant for Kenya's government transparency platform. Analyze this citizen feedback with real context.

Sector: {sector}
Feedback: "{feedback_text}"{context_info}

Provide analysis in JSON format:
{{
    "summary": "concise 1-2 sentence summary",
    "sentiment": "positive|neutral|negative",
    "topics": ["list", "of", "key", "topics"],
    "priority": "low|medium|high|urgent",
    "actionable": true/false,
    "confidence": 0.0-1.0,
    "personalized_response": "A warm, personalized 2-3 sentence response acknowledging their specific concern and referencing the real budget/spending data if relevant. Be empathetic and actionable."
}}"""
            
            response = model.models.generate_content(model=MODEL, contents=[prompt])
            result = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
            return result
        except Exception as e:
            print(f"Gemini feedback analysis error: {e}")
            return {
                "summary": feedback_text[:100] + "..." if len(feedback_text) > 100 else feedback_text,
                "sentiment": "neutral",
                "topics": [sector],
                "priority": "medium",
                "confidence": 0.5,
                "personalized_response": "Thank you for your feedback. We will review it carefully."
            }
    
    @staticmethod
    def generate_budget_insights(budget_data: Dict, feedback_summary: Optional[Dict] = None) -> str:
        model = GeminiAIService._get_model()
        if not model:
            return "Budget data analysis unavailable."
        
        try:
            feedback_context = ""
            if feedback_summary:
                feedback_context = f"""

CITIZEN FEEDBACK SUMMARY:
- Total Feedback: {feedback_summary.get('total', 0)}
- Top Concerns: {', '.join(feedback_summary.get('top_concerns', []))}
- Sentiment: {feedback_summary.get('overall_sentiment', 'neutral')}
- Most Discussed Sectors: {', '.join(feedback_summary.get('top_sectors', []))}
"""
            
            prompt = f"""You are an AI analyst for Kenya's government transparency platform. Analyze this budget data and provide personalized insights.

Budget Data:
{json.dumps(budget_data, indent=2)}{feedback_context}

Provide a warm, conversational analysis that:
1. Highlights key observations (2-3 points) with specific numbers
2. Identifies spending patterns and what they mean for citizens
3. Addresses citizen concerns if feedback data is provided
4. Gives practical recommendations
5. Compares across counties/sectors if data shows disparities

Tone: Friendly, transparent, empowering. Use Kenyan Shillings (KSh) format. Keep under 200 words."""
            
            response = model.models.generate_content(model=MODEL, contents=[prompt])
            return response.text
        except Exception as e:
            print(f"Gemini budget insights error: {e}")
            return "Unable to generate budget insights at this time."
    
    @staticmethod
    def explain_budget_to_citizen(budget_amount: float, sector: str, year: int) -> str:
        model = GeminiAIService._get_model()
        if not model:
            return f"The government allocated KSh {budget_amount:,.0f} for {sector} in {year}."
        
        try:
            prompt = f"""Explain this government budget allocation to an average Kenyan citizen in simple terms.

Sector: {sector}
Amount: KSh {budget_amount:,.0f}
Year: {year}

Provide:
1. What this money means in practical terms
2. What services/projects it covers
3. How it impacts citizens' daily lives

Keep it under 100 words, friendly tone, avoid jargon."""
            
            response = model.models.generate_content(model=MODEL, contents=[prompt])
            return response.text
        except Exception as e:
            print(f"Gemini explanation error: {e}")
            return f"The government allocated KSh {budget_amount:,.0f} for {sector} in {year}."
    
    @staticmethod
    def detect_spending_anomalies(expenditure_data: list) -> Dict:
        model = GeminiAIService._get_model()
        if not model:
            return {"anomalies": [], "insights": "Analysis unavailable"}
        
        try:
            prompt = f"""Analyze these government expenditures for anomalies or unusual patterns.

Expenditure Data:
{json.dumps(expenditure_data[:50], indent=2)}

Identify:
1. Unusual spending amounts
2. Suspicious patterns
3. Potential red flags
4. Recommendations

Respond in JSON:
{{
    "anomalies": [
        {{"description": "...", "severity": "low|medium|high", "expenditure_id": 123}}
    ],
    "insights": "overall analysis",
    "recommendations": ["list of recommendations"]
}}"""
            
            response = model.models.generate_content(model=MODEL, contents=[prompt])
            result = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
            return result
        except Exception as e:
            print(f"Gemini anomaly detection error: {e}")
            return {"anomalies": [], "insights": "Analysis unavailable"}
    
    @staticmethod
    def _basic_moderation(content: str) -> Dict:
        text = content.lower()
        flagged_words = ['spam', 'hate', 'inappropriate', 'offensive', 'scam', 'fraud']
        is_flagged = any(word in text for word in flagged_words)
        
        return {
            "is_flagged": is_flagged,
            "reason": "Contains potentially inappropriate content" if is_flagged else "Content appears clean",
            "confidence": 0.6 if is_flagged else 0.7,
            "category": "inappropriate" if is_flagged else "clean",
            "severity": "medium" if is_flagged else "low"
        }

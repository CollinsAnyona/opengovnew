# Google Gemini AI Integration

## Overview

OpenGov now uses Google Gemini AI for:
1. **Content Moderation** - Detect hate speech, spam, misinformation
2. **Feedback Analysis** - Sentiment analysis, topic extraction, priority detection
3. **Budget Insights** - Generate citizen-friendly explanations
4. **Anomaly Detection** - Identify unusual spending patterns

## Setup Instructions

### 1. Get Gemini API Key (FREE)

1. Go to **Google AI Studio**: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the API key

### 2. Configure Environment

Add to your `.env` file:
```bash
GEMINI_API_KEY=your-api-key-here
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs `google-generativeai` package.

### 4. Restart Backend

```bash
uvicorn main:app --reload
```

## Features

### 1. Smart Content Moderation

**Before (Basic):**
- Simple keyword matching
- Random confidence scores
- Generic flagging

**After (Gemini AI):**
- Context-aware analysis
- Detects sarcasm, hate speech, misinformation
- Categorizes violations (hate_speech, spam, harassment, etc.)
- Severity levels (low, medium, high)
- Detailed explanations

### 2. Intelligent Feedback Analysis

**Analyzes:**
- **Sentiment**: positive, neutral, negative
- **Topics**: Automatically extracts key topics
- **Priority**: low, medium, high, urgent
- **Actionability**: Whether feedback requires action
- **Summary**: Concise 1-2 sentence summary

**Example:**
```
Input: "The new hospital in Nairobi is great but lacks enough doctors"
Output: {
  "summary": "Positive feedback on new hospital infrastructure but concerns about staffing levels",
  "sentiment": "neutral",
  "topics": ["hospital", "infrastructure", "staffing", "healthcare"],
  "priority": "medium",
  "actionable": true
}
```

### 3. Budget Insights

**Generates:**
- Citizen-friendly explanations
- Spending pattern analysis
- Areas of concern
- Recommendations

**Example:**
```
Input: KSh 5,000,000,000 for Education, 2024
Output: "This KSh 5 billion allocation for Education will fund teacher salaries, 
school infrastructure, and learning materials across Kenya. This translates to 
approximately KSh 10,000 per student, covering textbooks, classroom improvements, 
and teacher training programs."
```

### 4. Anomaly Detection

**Identifies:**
- Unusual spending amounts
- Suspicious patterns
- Potential red flags
- Recommendations for investigation

## API Usage Limits

**Free Tier:**
- 60 requests per minute
- 1,500 requests per day
- Sufficient for development and small deployments

**Paid Tier:**
- Higher limits available
- Pay-as-you-go pricing

## Fallback Mechanism

If Gemini API is unavailable or API key is missing:
- System falls back to basic keyword matching
- No errors or crashes
- Reduced accuracy but functional

## Testing

### Test Content Moderation:
```bash
# Submit forum post with inappropriate content
# Check if it gets flagged with detailed reason
```

### Test Feedback Analysis:
```bash
# Submit citizen feedback
# Check AI analysis in admin panel
```

### Test Budget Insights:
```bash
# View budget details on dashboard
# Check for AI-generated explanations
```

## Troubleshooting

**"API key not found" error:**
- Check `.env` file has `GEMINI_API_KEY`
- Restart backend server
- Verify API key is valid

**"Rate limit exceeded":**
- Free tier: 60 requests/min
- Wait a minute or upgrade to paid tier

**"Invalid API key":**
- Regenerate key at https://makersuite.google.com/app/apikey
- Update `.env` file

## Security Notes

- Never commit `.env` file to Git
- Keep API key confidential
- Rotate keys regularly
- Monitor usage in Google AI Studio

## Cost Estimation

**Free Tier (Sufficient for most use cases):**
- 1,500 requests/day = FREE
- ~45,000 requests/month = FREE

**Typical Usage:**
- 100 feedback submissions/day = 100 requests
- 50 forum posts/day = 50 requests
- 20 budget insights/day = 20 requests
- **Total: ~170 requests/day** (well within free tier)

## Future Enhancements

- Multi-language support (Swahili, English)
- Voice-to-text feedback
- Chatbot for citizen queries
- Predictive budget analysis
- Automated report generation

## Support

For issues:
1. Check logs: `tail -f backend/logs/app.log`
2. Verify API key in `.env`
3. Test with basic content first
4. Contact Google AI Studio support

## Resources

- Google AI Studio: https://makersuite.google.com/
- Gemini API Docs: https://ai.google.dev/docs
- Python SDK: https://github.com/google/generative-ai-python

import random

class ForumModerationService:
    
    HARMFUL_KEYWORDS = [
        'hate', 'violence', 'attack', 'kill', 'threat', 'bomb', 'weapon',
        'racist', 'discrimination', 'abuse', 'harass', 'bully', 'offensive',
        'spam', 'scam', 'fraud', 'illegal', 'drugs', 'explicit', 'porn'
    ]
    
    POLITICAL_KEYWORDS = [
        'overthrow', 'revolution', 'coup', 'rebel', 'riot', 'protest violently'
    ]
    
    @staticmethod
    def moderate_content(text: str) -> dict:
        """
        Analyzes text content and returns moderation result
        Returns: {
            'is_flagged': bool,
            'reason': str or None,
            'confidence': float
        }
        """
        text_lower = text.lower()
        
        # Check for harmful keywords
        for keyword in ForumModerationService.HARMFUL_KEYWORDS:
            if keyword in text_lower:
                return {
                    'is_flagged': True,
                    'reason': f'Potentially harmful content detected: {keyword}',
                    'confidence': round(random.uniform(0.75, 0.95), 2)
                }
        
        # Check for political incitement
        for keyword in ForumModerationService.POLITICAL_KEYWORDS:
            if keyword in text_lower:
                return {
                    'is_flagged': True,
                    'reason': f'Political incitement detected: {keyword}',
                    'confidence': round(random.uniform(0.70, 0.90), 2)
                }
        
        # Check for excessive caps (shouting)
        if len(text) > 20:
            caps_ratio = sum(1 for c in text if c.isupper()) / len(text)
            if caps_ratio > 0.6:
                return {
                    'is_flagged': True,
                    'reason': 'Excessive capitalization detected',
                    'confidence': round(random.uniform(0.60, 0.80), 2)
                }
        
        # Check for spam patterns (repeated characters)
        if any(char * 5 in text_lower for char in 'abcdefghijklmnopqrstuvwxyz'):
            return {
                'is_flagged': True,
                'reason': 'Spam pattern detected',
                'confidence': round(random.uniform(0.65, 0.85), 2)
            }
        
        # Content is clean
        return {
            'is_flagged': False,
            'reason': None,
            'confidence': round(random.uniform(0.85, 0.98), 2)
        }

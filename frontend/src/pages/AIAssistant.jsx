import { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';
import { Bot, Send, Lightbulb, TrendingUp, Target } from 'lucide-react';
import { colors } from '../theme/colors';
import '../styles/responsive.css';

function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSuggestions();
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('ai_chat_history');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Add welcome message only if no saved history
      setMessages([{
        type: 'ai',
        text: "Hello! I'm your OpenGov AI Assistant. I have access to real-time budget and spending data. Ask me anything about government finances, sector allocations, or citizen feedback trends!",
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
    // Save messages to localStorage whenever messages change
    if (messages.length > 0) {
      localStorage.setItem('ai_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSuggestions = async () => {
    try {
      const response = await apiClient.get('/ai-assistant/suggestions');
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      type: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.post('/ai-assistant/chat', {
        message: text
      });

      const aiMessage = {
        type: 'ai',
        text: response.data.response,
        data: response.data.data_summary,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        type: 'ai',
        text: "I'm having trouble right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([{
      type: 'ai',
      text: "Hello! I'm your OpenGov AI Assistant. I have access to real-time budget and spending data. Ask me anything about government finances, sector allocations, or citizen feedback trends!",
      timestamp: new Date()
    }]);
    localStorage.removeItem('ai_chat_history');
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.background }}>
      {/* Header */}
      <div style={{ background: colors.primary, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: colors.white, fontSize: '20px', fontWeight: '600', margin: '0' }}>
              OpenGov Kenya
            </h1>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
            AI Budget Assistant
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 40px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: colors.dark, marginBottom: '8px' }}>
            AI Budget Assistant
          </h2>
          <p style={{ fontSize: '15px', color: colors.gray }}>
            Ask me anything about government budgets, spending, and citizen feedback
          </p>
        </div>
        {/* Chat Container */}
        <div style={{ 
          background: colors.white, 
          border: '1px solid ' + colors.border, 
          borderRadius: '12px', 
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
          marginBottom: '24px'
        }}>
          {/* Messages Area */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: msg.type === 'user' ? colors.primary : colors.background,
                  color: msg.type === 'user' ? colors.white : colors.dark,
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  {msg.data && (
                    <div style={{ 
                      marginTop: '12px', 
                      paddingTop: '12px', 
                      borderTop: '1px solid ' + colors.border,
                      fontSize: '12px',
                      color: colors.gray
                    }}>
                      <div><strong>Total Budget:</strong> KSh {msg.data.total_budget.toLocaleString()}</div>
                      <div><strong>Total Spent:</strong> KSh {msg.data.total_spent.toLocaleString()}</div>
                      <div><strong>Utilization:</strong> {msg.data.utilization_rate}%</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: colors.background,
                  color: colors.gray,
                  fontSize: '14px'
                }}>
                  <span>AI is thinking</span>
                  <span className="dots">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && suggestions.length > 0 && (
            <div style={{ 
              padding: '16px 24px', 
              borderTop: '1px solid ' + colors.border,
              background: colors.background
            }}>
              <div style={{ fontSize: '12px', color: colors.gray, marginBottom: '8px', fontWeight: '600' }}>
                Try asking:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {suggestions.slice(0, 4).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '6px 12px',
                      background: colors.white,
                      border: '1px solid ' + colors.border,
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: colors.gray,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = colors.primary;
                      e.currentTarget.style.color = colors.primary;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.color = colors.gray;
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit} style={{ 
            padding: '20px 24px', 
            borderTop: '1px solid ' + colors.border,
            background: colors.white,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about budgets, spending, sectors, or citizen feedback..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid ' + colors.border,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                color: colors.dark
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: '12px 24px',
                background: loading || !input.trim() ? colors.border : colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: loading || !input.trim() ? 'none' : '0 2px 4px rgba(16, 185, 129, 0.2)'
              }}
              onMouseOver={(e) => !loading && input.trim() && (e.target.style.background = colors.primaryDark)}
              onMouseOut={(e) => !loading && input.trim() && (e.target.style.background = colors.primary)}
            >
              <Send size={16} />
              Send
            </button>
            <button
              onClick={clearChat}
              type="button"
              style={{
                padding: '12px 20px',
                background: colors.background,
                border: '1px solid ' + colors.border,
                borderRadius: '8px',
                fontSize: '14px',
                color: colors.gray,
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = colors.border}
              onMouseOut={(e) => e.target.style.background = colors.background}
            >
              Clear
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ 
            background: colors.white, 
            border: '1px solid ' + colors.border, 
            borderRadius: '12px', 
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Lightbulb size={24} color={colors.warning} strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', color: colors.dark }}>
              Real-Time Data
            </h3>
            <p style={{ fontSize: '14px', color: colors.gray, margin: '0', lineHeight: '1.6' }}>
              I analyze live budget allocations, expenditures, and citizen feedback to give you accurate answers.
            </p>
          </div>

          <div style={{ 
            background: colors.white, 
            border: '1px solid ' + colors.border, 
            borderRadius: '12px', 
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <TrendingUp size={24} color={colors.primary} strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', color: colors.dark }}>
              Data-Driven Insights
            </h3>
            <p style={{ fontSize: '14px', color: colors.gray, margin: '0', lineHeight: '1.6' }}>
              Get specific numbers, trends, and comparisons across sectors and counties.
            </p>
          </div>

          <div style={{ 
            background: colors.white, 
            border: '1px solid ' + colors.border, 
            borderRadius: '12px', 
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(5, 150, 105, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Target size={24} color={colors.primaryDark} strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', color: colors.dark }}>
              Actionable Answers
            </h3>
            <p style={{ fontSize: '14px', color: colors.gray, margin: '0', lineHeight: '1.6' }}>
              Ask complex questions and get clear, actionable insights about government spending.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }
        .dots {
          animation: dots 1.5s infinite;
        }
      `}</style>
    </div>
  );
}

export default AIAssistant;

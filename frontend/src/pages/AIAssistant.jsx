import { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';
import { Bot, Send, Lightbulb, TrendingUp, Target } from 'lucide-react';

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
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', marginBottom: '30px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Bot size={32} color="#0066cc" strokeWidth={2} />
            <h1 style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: '700', margin: '0', flex: 1 }}>
              AI Budget Assistant
            </h1>
            <button
              onClick={clearChat}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#666',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Clear Chat
            </button>
          </div>
          <p style={{ color: '#666', fontSize: '15px', margin: '0' }}>
            Ask me anything about government budgets, spending, and citizen feedback. I have real-time data!
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px' }}>
        {/* Chat Container */}
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                  background: msg.type === 'user' ? '#0066cc' : '#f3f4f6',
                  color: msg.type === 'user' ? '#ffffff' : '#1a1a1a',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  {msg.data && (
                    <div style={{ 
                      marginTop: '12px', 
                      paddingTop: '12px', 
                      borderTop: '1px solid #e5e7eb',
                      fontSize: '12px',
                      color: '#666'
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
                  background: '#f3f4f6',
                  color: '#666',
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
              borderTop: '1px solid #e5e7eb',
              background: '#fafafa'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                Try asking:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {suggestions.slice(0, 4).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '6px 12px',
                      background: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#666',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#0066cc';
                      e.currentTarget.style.color = '#0066cc';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.color = '#666';
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
            borderTop: '1px solid #e5e7eb',
            background: '#ffffff'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about budgets, spending, sectors, or citizen feedback..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  padding: '12px 24px',
                  background: loading || !input.trim() ? '#d1d5db' : '#0066cc',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          marginTop: '24px'
        }}>
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            padding: '20px' 
          }}>
            <Lightbulb size={28} color="#f59e0b" strokeWidth={2} style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#1a1a1a' }}>
              Real-Time Data
            </h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '0', lineHeight: '1.5' }}>
              I analyze live budget allocations, expenditures, and citizen feedback to give you accurate answers.
            </p>
          </div>

          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            padding: '20px' 
          }}>
            <TrendingUp size={28} color="#0066cc" strokeWidth={2} style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#1a1a1a' }}>
              Data-Driven Insights
            </h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '0', lineHeight: '1.5' }}>
              Get specific numbers, trends, and comparisons across sectors and counties.
            </p>
          </div>

          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            padding: '20px' 
          }}>
            <Target size={28} color="#059669" strokeWidth={2} style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#1a1a1a' }}>
              Actionable Answers
            </h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '0', lineHeight: '1.5' }}>
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

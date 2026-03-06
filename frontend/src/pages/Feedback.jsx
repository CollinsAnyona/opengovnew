import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';

function Feedback() {
  const [message, setMessage] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [sectors, setSectors] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [moderation, setModeration] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await apiClient.get('/sectors');
        setSectors(response.data);
        if (response.data.length > 0) {
          setSectorId(response.data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch sectors:', err);
      }
    };
    fetchSectors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setModeration(null);
    setLoading(true);

    try {
      const feedbackResponse = await apiClient.post('/feedback', {
        sector_id: parseInt(sectorId),
        message
      });

      const moderationResponse = await apiClient.post('/ai/moderate', {
        feedback_id: feedbackResponse.data.id,
        text: message
      });

      setModeration(moderationResponse.data);
      setSuccess('Feedback submitted successfully!');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
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
            Citizen Feedback
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 40px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: colors.dark, marginBottom: '8px' }}>
            Citizen Governance Feedback Portal
          </h2>
          <p style={{ fontSize: '15px', color: colors.gray }}>
            Submit structured feedback to support transparent civic participation and governance accountability
          </p>
        </div>

      <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Submit Feedback</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: colors.dark, marginBottom: '8px' }}>
              Sector
            </label>
            <select 
              value={sectorId} 
              onChange={(e) => setSectorId(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', color: colors.dark, outline: 'none' }}
              required
            >
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name.charAt(0).toUpperCase() + sector.name.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: colors.dark, marginBottom: '8px' }}>
              Feedback Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your feedback regarding governance, budget allocation, or civic concerns..."
              rows={6}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', color: colors.dark, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              required
            />
          </div>

          {success && (
            <div style={{ padding: '12px 16px', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid ' + colors.success, color: colors.success, borderRadius: '8px', fontSize: '14px' }}>
              {success}
            </div>
          )}
          
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid ' + colors.danger, color: colors.danger, borderRadius: '8px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', background: loading ? colors.border : colors.primary, color: colors.white, fontWeight: '600', padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px', transition: 'all 0.2s ease', boxShadow: loading ? 'none' : '0 2px 4px rgba(16, 185, 129, 0.2)' }}
            onMouseOver={(e) => !loading && (e.target.style.background = colors.primaryDark)}
            onMouseOut={(e) => !loading && (e.target.style.background = colors.primary)}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      {moderation && (
        <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', padding: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.dark, marginBottom: '20px' }}>AI Moderation Result</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: colors.dark, marginRight: '12px' }}>Status:</span>
              <span style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                background: moderation.is_clean ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                color: moderation.is_clean ? colors.success : colors.danger
              }}>
                {moderation.is_clean ? 'Clean' : 'Flagged'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: colors.dark }}>AI Summary:</span>
              <p style={{ fontSize: '14px', color: colors.gray, marginTop: '6px', lineHeight: '1.6' }}>{moderation.summary}</p>
            </div>

            <div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: colors.dark }}>Confidence Score:</span>
              <p style={{ fontSize: '14px', color: colors.gray, marginTop: '6px' }}>{moderation.confidence_score}</p>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: colors.lightGray, marginTop: '20px', paddingTop: '20px', borderTop: '1px solid ' + colors.border }}>
            AI analysis is assistive and subject to human administrative review.
          </p>
        </div>
      )}
      </div>
    </div>
  );
}

export default Feedback;
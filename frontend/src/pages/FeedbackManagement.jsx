import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';

function FeedbackManagement() {
  const [feedback, setFeedback] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feedbackRes, sectorsRes] = await Promise.all([
        apiClient.get('/feedback'),
        apiClient.get('/sectors/')
      ]);
      setFeedback(feedbackRes.data || []);
      setSectors(sectorsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (feedbackId, newStatus) => {
    try {
      await apiClient.put(`/feedback/${feedbackId}`, { status: newStatus });
      setFeedback(feedback.map(item => 
        item.id === feedbackId ? { ...item, status: newStatus } : item
      ));
      if (selectedFeedback?.id === feedbackId) {
        setSelectedFeedback({ ...selectedFeedback, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleRespond = async (feedbackId) => {
    if (!response.trim()) {
      alert('Please enter a response');
      return;
    }
    try {
      await apiClient.post(`/feedback/${feedbackId}/respond`, { response: response.trim() });
      alert('Response sent successfully');
      setResponse('');
      setSelectedFeedback(null);
      fetchData();
    } catch (error) {
      console.error('Failed to send response:', error);
      alert('Failed to send response');
    }
  };

  const getSectorName = (sectorId) => {
    const sector = sectors.find(s => s.id === sectorId);
    return sector ? sector.name : 'Unknown';
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: { bg: '#fef3c7', color: '#92400e', label: 'New' },
      under_review: { bg: '#dbeafe', color: '#1e40af', label: 'Under Review' },
      approved: { bg: '#d1fae5', color: '#065f46', label: 'Resolved' },
      escalated: { bg: '#fee2e2', color: '#991b1b', label: 'Escalated' }
    };
    const style = styles[status] || styles.submitted;
    return (
      <span style={{ padding: '4px 12px', background: style.bg, color: style.color, borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
        {style.label}
      </span>
    );
  };

  const filteredFeedback = filter === 'all' 
    ? feedback 
    : feedback.filter(f => f.status === filter);

  const stats = {
    total: feedback.length,
    new: feedback.filter(f => f.status === 'submitted').length,
    reviewing: feedback.filter(f => f.status === 'under_review').length,
    resolved: feedback.filter(f => f.status === 'approved').length,
    escalated: feedback.filter(f => f.status === 'escalated').length
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: `4px solid ${colors.border}`, borderTop: `4px solid ${colors.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: colors.gray, fontSize: '16px' }}>Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px 40px' }}>
      <div style={{ background: colors.primary, color: colors.white, padding: '20px 30px', margin: '0 -30px 30px', borderRadius: '0' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0' }}>Feedback Management</h1>
        <p style={{ fontSize: '14px', margin: '0', opacity: '0.95' }}>Review and respond to citizen feedback</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: filter === 'all' ? `4px solid ${colors.primary}` : `4px solid transparent` }} onClick={() => setFilter('all')}>
          <div style={{ color: colors.gray, fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>TOTAL</div>
          <div style={{ color: colors.dark, fontSize: '32px', fontWeight: '700' }}>{stats.total}</div>
        </div>
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: filter === 'submitted' ? `4px solid #f59e0b` : `4px solid transparent` }} onClick={() => setFilter('submitted')}>
          <div style={{ color: colors.gray, fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>NEW</div>
          <div style={{ color: '#f59e0b', fontSize: '32px', fontWeight: '700' }}>{stats.new}</div>
        </div>
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: filter === 'under_review' ? `4px solid ${colors.info}` : `4px solid transparent` }} onClick={() => setFilter('under_review')}>
          <div style={{ color: colors.gray, fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>REVIEWING</div>
          <div style={{ color: colors.info, fontSize: '32px', fontWeight: '700' }}>{stats.reviewing}</div>
        </div>
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: filter === 'approved' ? `4px solid ${colors.success}` : `4px solid transparent` }} onClick={() => setFilter('approved')}>
          <div style={{ color: colors.gray, fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>RESOLVED</div>
          <div style={{ color: colors.success, fontSize: '32px', fontWeight: '700' }}>{stats.resolved}</div>
        </div>
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: filter === 'escalated' ? `4px solid ${colors.danger}` : `4px solid transparent` }} onClick={() => setFilter('escalated')}>
          <div style={{ color: colors.gray, fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>ESCALATED</div>
          <div style={{ color: colors.danger, fontSize: '32px', fontWeight: '700' }}>{stats.escalated}</div>
        </div>
      </div>

      {/* Feedback List */}
      <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '24px', borderBottom: `1px solid ${colors.border}` }}>
          <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0' }}>
            {filter === 'all' ? 'All Feedback' : `${filter.replace('_', ' ').toUpperCase()} Feedback`} ({filteredFeedback.length})
          </h3>
        </div>

        {filteredFeedback.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: colors.lightGray }}>
            No feedback found
          </div>
        ) : (
          <div>
            {filteredFeedback.map((item) => (
              <div key={item.id} style={{ padding: '24px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      {getStatusBadge(item.status)}
                      <span style={{ padding: '4px 12px', background: '#f3f4f6', color: colors.darkGray, borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        {getSectorName(item.sector_id)}
                      </span>
                      <span style={{ color: colors.lightGray, fontSize: '13px' }}>
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ color: colors.dark, fontSize: '15px', margin: '0', lineHeight: '1.6' }}>
                      {item.message}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {item.status === 'submitted' && (
                    <button onClick={() => updateStatus(item.id, 'under_review')} style={{ padding: '8px 16px', background: colors.info, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      Start Review
                    </button>
                  )}
                  {item.status === 'under_review' && (
                    <>
                      <button onClick={() => { setSelectedFeedback(item); setResponse(''); }} style={{ padding: '8px 16px', background: colors.success, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        Respond & Resolve
                      </button>
                      <button onClick={() => updateStatus(item.id, 'escalated')} style={{ padding: '8px 16px', background: colors.danger, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        Escalate
                      </button>
                    </>
                  )}
                  {item.status === 'escalated' && (
                    <button onClick={() => { setSelectedFeedback(item); setResponse(''); }} style={{ padding: '8px 16px', background: colors.success, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      Respond & Resolve
                    </button>
                  )}
                  {item.status === 'approved' && (
                    <span style={{ padding: '8px 16px', color: colors.success, fontSize: '13px', fontWeight: '600' }}>
                      ✓ Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedFeedback && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: colors.white, borderRadius: '12px', padding: '32px', maxWidth: '600px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.dark, marginBottom: '8px' }}>
              Respond to Feedback
            </h3>
            <p style={{ fontSize: '14px', color: colors.gray, marginBottom: '16px' }}>
              Sector: {getSectorName(selectedFeedback.sector_id)}
            </p>
            
            <div style={{ padding: '16px', background: colors.background, borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: colors.gray, marginBottom: '8px', fontWeight: '600' }}>Citizen Message:</div>
              <p style={{ fontSize: '14px', color: colors.dark, margin: '0', lineHeight: '1.6' }}>
                {selectedFeedback.message}
              </p>
            </div>

            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: colors.dark, marginBottom: '8px' }}>
              Your Response:
            </label>
            <textarea
              placeholder="Enter your response to the citizen..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              style={{ width: '100%', minHeight: '120px', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', marginBottom: '20px', resize: 'vertical', boxSizing: 'border-box' }}
            />
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setSelectedFeedback(null); setResponse(''); }}
                style={{ padding: '10px 20px', background: colors.white, color: colors.gray, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRespond(selectedFeedback.id)}
                style={{ padding: '10px 20px', background: colors.success, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Send Response & Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default FeedbackManagement;

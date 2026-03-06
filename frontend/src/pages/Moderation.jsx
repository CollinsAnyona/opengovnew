import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';

function Moderation() {
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [flaggedReplies, setFlaggedReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchFlaggedContent();
  }, []);

  const fetchFlaggedContent = async () => {
    setLoading(true);
    try {
      const [postsRes, repliesRes] = await Promise.all([
        apiClient.get('/forum/admin/flagged-posts'),
        apiClient.get('/forum/admin/flagged-replies')
      ]);
      setFlaggedPosts(postsRes.data || []);
      setFlaggedReplies(repliesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch flagged content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (contentId, contentType, action) => {
    try {
      const endpoint = contentType === 'post' 
        ? `/forum/admin/moderate-post/${contentId}`
        : `/forum/admin/moderate-reply/${contentId}`;
      
      await apiClient.post(endpoint, {
        action,
        message: actionMessage
      });
      
      setActionModal(null);
      setActionMessage('');
      fetchFlaggedContent();
      alert(`Content ${action}ed successfully`);
    } catch (error) {
      console.error('Moderation action failed:', error);
      alert('Failed to perform moderation action');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: `4px solid ${colors.border}`, borderTop: `4px solid ${colors.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: colors.gray, fontSize: '16px' }}>Loading flagged content...</p>
        </div>
      </div>
    );
  }

  const allFlagged = [...flaggedPosts, ...flaggedReplies].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px 40px' }}>
      {/* Header */}
      <div style={{ background: colors.primary, color: colors.white, padding: '20px 30px', margin: '0 -30px 30px', borderRadius: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0' }}>Content Moderation</h1>
            <p style={{ fontSize: '14px', margin: '0', opacity: '0.95' }}>Review AI-flagged forum content</p>
          </div>
          <div style={{ fontSize: '13px', opacity: '0.9' }}>OpenGov Kenya</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ color: colors.gray, fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>FLAGGED POSTS</div>
          <div style={{ color: colors.danger, fontSize: '32px', fontWeight: '700' }}>{flaggedPosts.length}</div>
        </div>
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ color: colors.gray, fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>FLAGGED REPLIES</div>
          <div style={{ color: colors.warning, fontSize: '32px', fontWeight: '700' }}>{flaggedReplies.length}</div>
        </div>
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ color: colors.gray, fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>TOTAL FLAGGED</div>
          <div style={{ color: colors.primary, fontSize: '32px', fontWeight: '700' }}>{allFlagged.length}</div>
        </div>
      </div>

      {/* Flagged Content List */}
      <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '24px', borderBottom: `1px solid ${colors.border}` }}>
          <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0' }}>Flagged Content</h3>
        </div>

        {allFlagged.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: colors.lightGray }}>
            No flagged content to review
          </div>
        ) : (
          <div>
            {allFlagged.map((item) => (
              <div key={`${item.type}-${item.id}`} style={{ padding: '24px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <span style={{ padding: '4px 12px', background: item.type === 'post' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: item.type === 'post' ? colors.danger : colors.warning, borderRadius: '6px', fontSize: '12px', fontWeight: '600', marginRight: '8px', textTransform: 'uppercase' }}>
                      {item.type}
                    </span>
                    <span style={{ color: colors.gray, fontSize: '14px' }}>
                      by {item.user_name} ({item.user_email})
                    </span>
                  </div>
                  <span style={{ padding: '4px 12px', background: 'rgba(245, 158, 11, 0.1)', color: colors.warning, borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                    {item.moderation_status}
                  </span>
                </div>

                {item.type === 'post' && (
                  <h4 style={{ color: colors.dark, fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>{item.title}</h4>
                )}
                {item.type === 'reply' && (
                  <div style={{ color: colors.gray, fontSize: '13px', marginBottom: '8px' }}>
                    Reply in: <strong>{item.post_title}</strong>
                  </div>
                )}

                <p style={{ color: colors.darkGray, fontSize: '14px', margin: '0 0 12px 0' }}>{item.content}</p>

                <div style={{ padding: '12px', background: 'rgba(220, 38, 38, 0.05)', border: `1px solid ${colors.danger}`, borderRadius: '6px', marginBottom: '16px' }}>
                  <strong style={{ color: colors.danger, fontSize: '13px' }}>AI Flag Reason:</strong>
                  <span style={{ color: colors.danger, fontSize: '13px', marginLeft: '8px' }}>{item.flagged_reason}</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleModeration(item.id, item.type, 'approve')}
                    style={{ padding: '8px 16px', background: colors.success, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setActionModal({ id: item.id, type: item.type, action: 'warn' })}
                    style={{ padding: '8px 16px', background: colors.warning, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Warn User
                  </button>
                  <button
                    onClick={() => setActionModal({ id: item.id, type: item.type, action: 'remove' })}
                    style={{ padding: '8px 16px', background: colors.danger, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Remove Content
                  </button>
                  <button
                    onClick={() => setActionModal({ id: item.id, type: item.type, action: 'suspend' })}
                    style={{ padding: '8px 16px', background: '#991b1b', color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Suspend User
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: colors.white, borderRadius: '12px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.dark, marginBottom: '8px', textTransform: 'capitalize' }}>
              {actionModal.action} Content
            </h3>
            <p style={{ fontSize: '14px', color: colors.gray, marginBottom: '24px' }}>
              Provide a reason for this action (will be sent to the user via email):
            </p>
            
            <textarea
              placeholder="Enter reason or message..."
              value={actionMessage}
              onChange={(e) => setActionMessage(e.target.value)}
              style={{ width: '100%', minHeight: '100px', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', marginBottom: '20px', resize: 'vertical' }}
            />
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setActionModal(null); setActionMessage(''); }}
                style={{ padding: '10px 20px', background: colors.white, color: colors.gray, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleModeration(actionModal.id, actionModal.type, actionModal.action)}
                style={{ padding: '10px 20px', background: colors.primary, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
              >
                Confirm {actionModal.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Moderation;

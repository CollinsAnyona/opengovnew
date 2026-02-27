import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

function ForumPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await apiClient.get(`/forum/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/forum/posts/${id}/replies`, { content: replyContent });
      setReplyContent('');
      fetchPost();
    } catch (error) {
      console.error('Failed to post reply:', error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '4px solid #e5e7eb', borderTop: '4px solid #0066cc', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#999', fontSize: '16px' }}>Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/forum')}
          style={{
            padding: '8px 16px',
            background: '#ffffff',
            color: '#666',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          ← Back to Forum
        </button>

        {/* Post */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{
              padding: '6px 14px',
              background: post.category === 'education' ? '#dbeafe' : post.category === 'health' ? '#dcfce7' : '#f3f4f6',
              color: post.category === 'education' ? '#1e40af' : post.category === 'health' ? '#166534' : '#666',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {post.category}
            </span>
            <span style={{ color: '#999', fontSize: '14px' }}>
              Posted by {post.user_name} • {getTimeAgo(post.created_at)}
            </span>
          </div>
          
          <h1 style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: '700', margin: '0 0 16px 0', lineHeight: '1.3' }}>
            {post.title}
          </h1>
          
          <p style={{ color: '#333', fontSize: '16px', lineHeight: '1.7', margin: '0', whiteSpace: 'pre-wrap' }}>
            {post.content}
          </p>
        </div>

        {/* Reply Form */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '700', marginBottom: '16px', margin: '0 0 16px 0' }}>
            Add Your Reply
          </h3>
          <form onSubmit={handleReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows="4"
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', resize: 'vertical', marginBottom: '12px' }}
              required
            />
            <button
              type="submit"
              style={{ padding: '10px 24px', background: '#0066cc', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
            >
              Post Reply
            </button>
          </form>
        </div>

        {/* Replies */}
        <div>
          <h3 style={{ color: '#1a1a1a', fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
            {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
          </h3>
          
          {post.replies.length === 0 ? (
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#999', fontSize: '15px' }}>No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {post.replies.map((reply) => (
                <div key={reply.id} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#0066cc',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {reply.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: '#1a1a1a', fontSize: '15px', fontWeight: '600' }}>{reply.user_name}</div>
                      <div style={{ color: '#999', fontSize: '13px' }}>{getTimeAgo(reply.created_at)}</div>
                    </div>
                  </div>
                  <p style={{ color: '#333', fontSize: '15px', lineHeight: '1.6', margin: '0', whiteSpace: 'pre-wrap' }}>
                    {reply.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ForumPost;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';

function ForumPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(false);
  const [editPostData, setEditPostData] = useState({ title: '', content: '', category: '' });
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchPost();
    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = parseInt(payload.sub);
        setCurrentUserId(userId);
        console.log('Current User ID:', userId);
      } catch (e) {
        console.error('Failed to parse token:', e);
      }
    } else {
      console.log('No token found');
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await apiClient.get(`/forum/posts/${id}`);
      setPost(response.data);
      console.log('Post User ID:', response.data.user_id);
      console.log('Post data:', response.data);
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

  const handleEditPost = () => {
    setEditPostData({ title: post.title, content: post.content, category: post.category });
    setEditingPost(true);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/forum/posts/${id}`, editPostData);
      setEditingPost(false);
      fetchPost();
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await apiClient.delete(`/forum/posts/${id}`);
        navigate('/forum');
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleEditReply = (reply) => {
    setEditingReply(reply.id);
    setEditReplyContent(reply.content);
  };

  const handleUpdateReply = async (replyId) => {
    try {
      await apiClient.put(`/forum/posts/${id}/replies/${replyId}`, { content: editReplyContent });
      setEditingReply(null);
      setEditReplyContent('');
      fetchPost();
    } catch (error) {
      console.error('Failed to update reply:', error);
      alert('Failed to update reply');
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      try {
        await apiClient.delete(`/forum/posts/${id}/replies/${replyId}`);
        fetchPost();
      } catch (error) {
        console.error('Failed to delete reply:', error);
        alert('Failed to delete reply');
      }
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '4px solid ' + colors.border, borderTop: '4px solid ' + colors.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', background: colors.background, padding: '40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: colors.lightGray, fontSize: '16px' }}>Post not found</p>
        </div>
      </div>
    );
  }

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
            Community Forum
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 40px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/forum')}
          style={{
            padding: '10px 20px',
            background: colors.white,
            color: colors.gray,
            border: '1px solid ' + colors.border,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '24px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.background = colors.background}
          onMouseOut={(e) => e.target.style.background = colors.white}
        >
          ← Back to Forum
        </button>

        {/* Post */}
        <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '32px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          {editingPost ? (
            <form onSubmit={handleUpdatePost}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Category</label>
                <select
                  value={editPostData.category}
                  onChange={(e) => setEditPostData({ ...editPostData, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', color: colors.dark }}
                >
                  <option value="general">General</option>
                  <option value="education">Education</option>
                  <option value="health">Health</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Title</label>
                <input
                  type="text"
                  value={editPostData.title}
                  onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', color: colors.dark, boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Content</label>
                <textarea
                  value={editPostData.content}
                  onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })}
                  rows="6"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', color: colors.dark, boxSizing: 'border-box', resize: 'vertical' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ padding: '10px 20px', background: colors.primary, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditingPost(false)} style={{ padding: '10px 20px', background: colors.white, color: colors.gray, border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '6px 14px',
                background: post.category === 'education' ? '#dbeafe' : post.category === 'health' ? '#dcfce7' : colors.background,
                color: post.category === 'education' ? colors.primaryDark : post.category === 'health' ? '#166534' : colors.gray,
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {post.category}
              </span>
              <span style={{ color: colors.lightGray, fontSize: '14px' }}>
                Posted by {post.user_name} • {formatDateTime(post.created_at)}
              </span>
            </div>
            {currentUserId === post.user_id && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleEditPost}
                  style={{ padding: '6px 12px', background: colors.info, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={handleDeletePost}
                  style={{ padding: '6px 12px', background: colors.danger, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <h1 style={{ color: colors.dark, fontSize: '28px', fontWeight: '700', margin: '0 0 16px 0', lineHeight: '1.3' }}>
            {post.title}
          </h1>
          
          <p style={{ color: colors.darkGray, fontSize: '16px', lineHeight: '1.7', margin: '0', whiteSpace: 'pre-wrap' }}>
            {post.content}
          </p>
            </>
          )}
        </div>

        {/* Reply Form */}
        <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', marginBottom: '16px', margin: '0 0 16px 0' }}>
            Add Your Reply
          </h3>
          <form onSubmit={handleReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows="4"
              style={{ width: '100%', padding: '12px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', resize: 'vertical', marginBottom: '12px', color: colors.dark }}
              required
            />
            <button
              type="submit"
              style={{ padding: '10px 24px', background: colors.primary, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
              onMouseOver={(e) => e.target.style.background = colors.primaryDark}
              onMouseOut={(e) => e.target.style.background = colors.primary}
            >
              Post Reply
            </button>
          </form>
        </div>

        {/* Replies */}
        <div>
          <h3 style={{ color: colors.dark, fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
            {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
          </h3>
          
          {post.replies.length === 0 ? (
            <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
              <p style={{ color: colors.lightGray, fontSize: '15px' }}>No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {post.replies.map((reply) => (
                <div key={reply.id} style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                  {editingReply === reply.id ? (
                    <div>
                      <textarea
                        value={editReplyContent}
                        onChange={(e) => setEditReplyContent(e.target.value)}
                        rows="4"
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', color: colors.dark, boxSizing: 'border-box', resize: 'vertical', marginBottom: '12px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleUpdateReply(reply.id)} style={{ padding: '8px 16px', background: colors.primary, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                          Save
                        </button>
                        <button onClick={() => setEditingReply(null)} style={{ padding: '8px 16px', background: colors.white, color: colors.gray, border: '1px solid ' + colors.border, borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: colors.primary,
                        color: colors.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        {reply.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: colors.dark, fontSize: '15px', fontWeight: '600' }}>{reply.user_name}</div>
                        <div style={{ color: colors.lightGray, fontSize: '13px' }}>{formatDateTime(reply.created_at)}</div>
                      </div>
                    </div>
                    {currentUserId === reply.user_id && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEditReply(reply)} style={{ padding: '4px 10px', background: colors.info, color: colors.white, border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteReply(reply.id)} style={{ padding: '4px 10px', background: colors.danger, color: colors.white, border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <p style={{ color: colors.darkGray, fontSize: '15px', lineHeight: '1.6', margin: '0', whiteSpace: 'pre-wrap' }}>
                    {reply.content}
                  </p>
                    </>
                  )}
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

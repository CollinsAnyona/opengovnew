import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';
import { getUserRole } from '../auth/authUtils';

function Forum() {
  const [posts, setPosts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [category, setCategory] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', sector_id: null });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userRole = getUserRole();
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  useEffect(() => {
    fetchSectors();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [category, selectedSector]);

  const fetchSectors = async () => {
    try {
      const response = await apiClient.get('/sectors/');
      setSectors(response.data);
    } catch (error) {
      console.error('Failed to fetch sectors:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = '/forum/posts?';
      if (category !== 'all') url += `category=${category}&`;
      if (selectedSector !== 'all') url += `sector_id=${selectedSector}`;
      const response = await apiClient.get(url);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/forum/posts', newPost);
      setNewPost({ title: '', content: '', category: 'general' });
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleDeletePost = async (postId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await apiClient.delete(`/forum/admin/posts/${postId}`);
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
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
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: colors.dark, marginBottom: '8px' }}>
            Community Forum
          </h2>
          <p style={{ fontSize: '15px', color: colors.gray }}>
            Discuss budget concerns and share insights with fellow citizens
          </p>
        </div>
        {/* Actions Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ color: colors.dark, fontSize: '14px', fontWeight: '600' }}>Filter by Sector:</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', background: colors.white, cursor: 'pointer', color: colors.dark }}
              >
                <option value="all">All Sectors</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>{sector.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowCreatePost(!showCreatePost)}
              style={{
                padding: '12px 24px',
                background: colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = colors.primaryDark}
              onMouseOut={(e) => e.target.style.background = colors.primary}
            >
              + New Discussion
            </button>
          </div>
        </div>

        {/* Create Post Form */}
        {showCreatePost && (
          <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', marginBottom: '20px', margin: '0 0 20px 0' }}>
              Start a New Discussion
            </h3>
            <form onSubmit={handleCreatePost}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Sector (Optional)
                </label>
                <select
                  value={newPost.sector_id || ''}
                  onChange={(e) => setNewPost({ ...newPost, sector_id: e.target.value ? parseInt(e.target.value) : null })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', color: colors.dark }}
                >
                  <option value="">No specific sector</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>{sector.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="What would you like to discuss?"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', color: colors.dark }}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts, questions, or concerns..."
                  rows="5"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', color: colors.dark }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', background: colors.primary, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
                  onMouseOver={(e) => e.target.style.background = colors.primaryDark}
                  onMouseOut={(e) => e.target.style.background = colors.primary}
                >
                  Post Discussion
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  style={{ padding: '10px 24px', background: colors.white, color: colors.gray, border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseOver={(e) => e.target.style.background = colors.background}
                  onMouseOut={(e) => e.target.style.background = colors.white}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid ' + colors.border, borderTop: '4px solid ' + colors.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '60px 28px', textAlign: 'center' }}>
            <p style={{ color: colors.lightGray, fontSize: '16px' }}>No discussions yet. Start the conversation!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/forum/${post.id}`)}
                style={{
                  background: colors.white,
                  border: '1px solid ' + colors.border,
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.06)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0' }}>
                        {post.title}
                      </h3>
                      {post.sector_name && (
                        <span style={{
                          padding: '2px 8px',
                          background: '#f0f9ff',
                          color: colors.primary,
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {post.sector_name}
                        </span>
                      )}
                    </div>
                    <p style={{ color: colors.gray, fontSize: '14px', margin: '0', lineHeight: '1.5' }}>
                      {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: colors.lightGray, fontSize: '13px' }}>
                  <span>By {post.user_name}</span>
                  <span>•</span>
                  <span>{formatDateTime(post.created_at)}</span>
                  <span>•</span>
                  <span style={{ color: colors.primary, fontWeight: '600' }}>{post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}</span>
                  {isAdmin && (
                    <>
                      <span>•</span>
                      <button
                        onClick={(e) => handleDeletePost(post.id, e)}
                        style={{ padding: '4px 12px', background: colors.danger, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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

export default Forum;

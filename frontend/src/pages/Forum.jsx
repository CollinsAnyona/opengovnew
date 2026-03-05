import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

function Forum() {
  const [posts, setPosts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [category, setCategory] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general', sector_id: null });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', marginBottom: '30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 40px' }}>
          <h1 style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
            Community Forum
          </h1>
          <p style={{ color: '#666', fontSize: '15px', margin: '0' }}>
            Discuss budget concerns and share insights with fellow citizens
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        {/* Actions Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ color: '#666', fontSize: '14px', fontWeight: '600' }}>Filter by Sector:</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: '#ffffff', cursor: 'pointer' }}
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
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
              }}
            >
              + New Discussion
            </button>
          </div>
        </div>

        {/* Create Post Form */}
        {showCreatePost && (
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '700', marginBottom: '20px', margin: '0 0 20px 0' }}>
              Start a New Discussion
            </h3>
            <form onSubmit={handleCreatePost}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  required
                >
                  <option value="general">General</option>
                  <option value="education">Education</option>
                  <option value="health">Health</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Sector (Optional)
                </label>
                <select
                  value={newPost.sector_id || ''}
                  onChange={(e) => setNewPost({ ...newPost, sector_id: e.target.value ? parseInt(e.target.value) : null })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="">No specific sector</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>{sector.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="What would you like to discuss?"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts, questions, or concerns..."
                  rows="5"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', background: '#0066cc', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Post Discussion
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  style={{ padding: '10px 24px', background: '#ffffff', color: '#666', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
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
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #0066cc', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '60px 28px', textAlign: 'center' }}>
            <p style={{ color: '#999', fontSize: '16px' }}>No discussions yet. Start the conversation!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/forum/${post.id}`)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#0066cc';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,102,204,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '700', margin: '0' }}>
                        {post.title}
                      </h3>
                      {post.sector_name && (
                        <span style={{
                          padding: '2px 8px',
                          background: '#f0f9ff',
                          color: '#0066cc',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {post.sector_name}
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#666', fontSize: '14px', margin: '0', lineHeight: '1.5' }}>
                      {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    background: post.category === 'education' ? '#dbeafe' : post.category === 'health' ? '#dcfce7' : '#f3f4f6',
                    color: post.category === 'education' ? '#1e40af' : post.category === 'health' ? '#166534' : '#666',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    marginLeft: '16px',
                    flexShrink: 0
                  }}>
                    {post.category}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#999', fontSize: '13px' }}>
                  <span>By {post.user_name}</span>
                  <span>•</span>
                  <span>{getTimeAgo(post.created_at)}</span>
                  <span>•</span>
                  <span style={{ color: '#0066cc', fontWeight: '600' }}>{post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}</span>
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

import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

function SuperAdmin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [flaggedContent, setFlaggedContent] = useState({ posts: [], replies: [] });
  const [loading, setLoading] = useState(false);
  
  // User form
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'citizen' });
  const [newSector, setNewSector] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        try {
          const res = await apiClient.get('/super-admin/analytics/overview');
          setAnalytics(res.data);
        } catch (error) {
          console.error('Analytics error:', error);
          setAnalytics({ total_users: 0, total_budgets: 0, total_budget_amount: 0, total_feedback: 0, total_forum_posts: 0, flagged_posts: 0, active_users: 0 });
        }
      } else if (activeTab === 'users') {
        try {
          const res = await apiClient.get('/super-admin/users');
          setUsers(res.data);
        } catch (error) {
          console.error('Users error:', error);
          setUsers([]);
        }
      } else if (activeTab === 'sectors') {
        try {
          const res = await apiClient.get('/super-admin/sectors');
          setSectors(res.data);
        } catch (error) {
          console.error('Sectors error:', error);
          setSectors([]);
        }
      } else if (activeTab === 'audit') {
        try {
          const res = await apiClient.get('/super-admin/audit-logs');
          setAuditLogs(res.data);
        } catch (error) {
          console.error('Audit logs error:', error);
          setAuditLogs([]);
        }
      } else if (activeTab === 'moderation') {
        try {
          const res = await apiClient.get('/super-admin/forum/flagged-content');
          setFlaggedContent(res.data);
        } catch (error) {
          console.error('Moderation error:', error);
          setFlaggedContent({ posts: [], replies: [] });
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/super-admin/users', newUser);
      setNewUser({ name: '', email: '', password: '', role: 'citizen' });
      fetchData();
      alert('User created successfully');
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiClient.delete(`/super-admin/users/${userId}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await apiClient.put(`/super-admin/users/${userId}`, { is_active: !isActive });
      fetchData();
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const createSector = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/super-admin/sectors', newSector);
      setNewSector({ name: '', description: '' });
      fetchData();
      alert('Sector created successfully');
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create sector');
    }
  };

  const deleteSector = async (sectorId) => {
    if (!confirm('Are you sure? This will affect all related budgets.')) return;
    try {
      await apiClient.delete(`/super-admin/sectors/${sectorId}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete sector');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', borderBottom: '3px solid #6d28d9', marginBottom: '30px', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <div>
              <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '700', margin: '0' }}>
                Super Admin Control Panel
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: '5px 0 0 0' }}>
                System-wide management and oversight
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '0' }}>
          {['overview', 'users', 'sectors', 'moderation', 'audit'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                background: activeTab === tab ? '#7c3aed' : 'transparent',
                color: activeTab === tab ? '#ffffff' : '#666',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #7c3aed' : '3px solid transparent',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '4px solid #e5e7eb', borderTop: '4px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && analytics && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ background: '#ffffff', border: '2px solid #7c3aed', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ color: '#666', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>TOTAL USERS</div>
                    <div style={{ color: '#7c3aed', fontSize: '36px', fontWeight: '700' }}>{analytics.total_users}</div>
                    <div style={{ color: '#999', fontSize: '13px' }}>{analytics.active_users} active</div>
                  </div>
                  <div style={{ background: '#ffffff', border: '2px solid #0066cc', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ color: '#666', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>TOTAL BUDGETS</div>
                    <div style={{ color: '#0066cc', fontSize: '36px', fontWeight: '700' }}>{analytics.total_budgets}</div>
                    <div style={{ color: '#999', fontSize: '13px' }}>KSh {analytics.total_budget_amount.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#ffffff', border: '2px solid #059669', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ color: '#666', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>CITIZEN FEEDBACK</div>
                    <div style={{ color: '#059669', fontSize: '36px', fontWeight: '700' }}>{analytics.total_feedback}</div>
                    <div style={{ color: '#999', fontSize: '13px' }}>Total submissions</div>
                  </div>
                  <div style={{ background: '#ffffff', border: '2px solid #dc2626', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ color: '#666', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>FLAGGED CONTENT</div>
                    <div style={{ color: '#dc2626', fontSize: '36px', fontWeight: '700' }}>{analytics.flagged_posts}</div>
                    <div style={{ color: '#999', fontSize: '13px' }}>Needs review</div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
                  <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '700', marginBottom: '20px', margin: '0 0 20px 0' }}>
                    Create New User
                  </h3>
                  <form onSubmit={createUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="citizen">Citizen</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <button type="submit" style={{ padding: '10px 20px', background: '#7c3aed', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      Create User
                    </button>
                  </form>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f9fafb' }}>
                      <tr>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>NAME</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>EMAIL</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>ROLE</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>STATUS</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '16px 20px', fontSize: '14px', color: '#1a1a1a' }}>{user.name}</td>
                          <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>{user.email}</td>
                          <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                            <span style={{ padding: '4px 12px', background: user.role === 'super_admin' ? '#fef3c7' : user.role === 'admin' ? '#dbeafe' : '#f3f4f6', color: user.role === 'super_admin' ? '#92400e' : user.role === 'admin' ? '#1e40af' : '#666', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                            <span style={{ padding: '4px 12px', background: user.is_active ? '#dcfce7' : '#fee2e2', color: user.is_active ? '#166534' : '#991b1b', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                            <button onClick={() => toggleUserStatus(user.id, user.is_active)} style={{ marginRight: '8px', padding: '6px 12px', background: '#f59e0b', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                              {user.is_active ? 'Suspend' : 'Activate'}
                            </button>
                            {user.role !== 'super_admin' && (
                              <button onClick={() => deleteUser(user.id)} style={{ padding: '6px 12px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sectors Tab */}
            {activeTab === 'sectors' && (
              <div>
                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
                  <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '700', marginBottom: '20px', margin: '0 0 20px 0' }}>
                    Add New Ministry Sector
                  </h3>
                  <form onSubmit={createSector} style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1fr', gap: '16px' }}>
                    <input
                      type="text"
                      placeholder="Sector Name (e.g., Agriculture)"
                      value={newSector.name}
                      onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
                      style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newSector.description}
                      onChange={(e) => setNewSector({ ...newSector, description: e.target.value })}
                      style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                    />
                    <button type="submit" style={{ padding: '10px 20px', background: '#7c3aed', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      Add Sector
                    </button>
                  </form>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {sectors.map(sector => (
                    <div key={sector.id} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
                      <h4 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' }}>{sector.name}</h4>
                      <p style={{ color: '#666', fontSize: '14px', margin: '0 0 16px 0' }}>{sector.description || 'No description'}</p>
                      <button onClick={() => deleteSector(sector.id)} style={{ padding: '8px 16px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        Delete Sector
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moderation Tab */}
            {activeTab === 'moderation' && (
              <div>
                <h3 style={{ color: '#1a1a1a', fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
                  Flagged Forum Content
                </h3>
                
                {flaggedContent.posts.length === 0 && flaggedContent.replies.length === 0 ? (
                  <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#999' }}>
                    No flagged content to review
                  </div>
                ) : (
                  <>
                    {flaggedContent.posts.map(post => (
                      <div key={post.id} style={{ background: '#ffffff', border: '2px solid #dc2626', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div>
                            <span style={{ padding: '4px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>POST</span>
                            <span style={{ color: '#666', fontSize: '14px' }}>by {post.user_name} ({post.user_email})</span>
                          </div>
                          <span style={{ padding: '4px 12px', background: '#fef3c7', color: '#92400e', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{post.moderation_status}</span>
                        </div>
                        <h4 style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>{post.title}</h4>
                        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 12px 0' }}>{post.content}</p>
                        <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '6px', marginBottom: '12px' }}>
                          <strong style={{ color: '#991b1b', fontSize: '13px' }}>AI Flag Reason:</strong>
                          <span style={{ color: '#991b1b', fontSize: '13px', marginLeft: '8px' }}>{post.flagged_reason}</span>
                        </div>
                      </div>
                    ))}

                    {flaggedContent.replies.map(reply => (
                      <div key={reply.id} style={{ background: '#ffffff', border: '2px solid #f59e0b', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div>
                            <span style={{ padding: '4px 12px', background: '#fef3c7', color: '#92400e', borderRadius: '6px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>REPLY</span>
                            <span style={{ color: '#666', fontSize: '14px' }}>by {reply.user_name} in "{reply.post_title}"</span>
                          </div>
                          <span style={{ padding: '4px 12px', background: '#fef3c7', color: '#92400e', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{reply.moderation_status}</span>
                        </div>
                        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 12px 0' }}>{reply.content}</p>
                        <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '6px' }}>
                          <strong style={{ color: '#92400e', fontSize: '13px' }}>AI Flag Reason:</strong>
                          <span style={{ color: '#92400e', fontSize: '13px', marginLeft: '8px' }}>{reply.flagged_reason}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Audit Tab */}
            {activeTab === 'audit' && (
              <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '700', margin: '0' }}>System Audit Logs</h3>
                </div>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {auditLogs.map(log => (
                    <div key={log.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#1a1a1a', fontSize: '14px', fontWeight: '600' }}>{log.user_name}</span>
                        <span style={{ color: '#999', fontSize: '12px' }}>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <div style={{ color: '#666', fontSize: '13px' }}>
                        <span style={{ padding: '2px 8px', background: '#f3f4f6', borderRadius: '4px', marginRight: '8px', fontWeight: '600' }}>{log.action}</span>
                        {log.details}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
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

export default SuperAdmin;

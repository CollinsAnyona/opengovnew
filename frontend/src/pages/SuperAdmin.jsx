import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';

function SuperAdmin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [flaggedContent, setFlaggedContent] = useState({ posts: [], replies: [] });
  const [loading, setLoading] = useState(false);
  
  // User form
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'citizen' });
  const [newSector, setNewSector] = useState({ name: '', description: '' });
  const [newBudget, setNewBudget] = useState({ sector_id: '', year: new Date().getFullYear(), amount: '', description: '' });
  const [newExpenditure, setNewExpenditure] = useState({ budget_id: '', amount: '', description: '' });
  
  // Budget upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [expandedBudget, setExpandedBudget] = useState(null);
  const [expandedExpenditure, setExpandedExpenditure] = useState(null);
  const [budgetFilters, setBudgetFilters] = useState({ county: '', year: '', sector: '' });

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
      } else if (activeTab === 'budgets') {
        try {
          const [sectorsRes, budgetsRes] = await Promise.all([
            apiClient.get('/super-admin/sectors'),
            apiClient.get('/super-admin/budgets')
          ]);
          setSectors(sectorsRes.data);
          setBudgets(budgetsRes.data);
        } catch (error) {
          console.error('Budgets error:', error);
          setBudgets([]);
        }
      } else if (activeTab === 'expenditures') {
        try {
          const [budgetsRes, expendituresRes] = await Promise.all([
            apiClient.get('/super-admin/budgets'),
            apiClient.get('/super-admin/expenditures')
          ]);
          setBudgets(budgetsRes.data);
          setExpenditures(expendituresRes.data);
        } catch (error) {
          console.error('Expenditures error:', error);
          setExpenditures([]);
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

  const createBudget = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/super-admin/budgets', {
        ...newBudget,
        sector_id: parseInt(newBudget.sector_id),
        year: parseInt(newBudget.year),
        amount: parseFloat(newBudget.amount)
      });
      setNewBudget({ sector_id: '', year: new Date().getFullYear(), amount: '', description: '' });
      fetchData();
      alert('Budget created successfully with AI explanation!');
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create budget');
    }
  };

  const deleteBudget = async (budgetId) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await apiClient.delete(`/super-admin/budgets/${budgetId}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete budget');
    }
  };

  const createExpenditure = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/super-admin/expenditures', {
        ...newExpenditure,
        budget_id: parseInt(newExpenditure.budget_id),
        amount: parseFloat(newExpenditure.amount)
      });
      setNewExpenditure({ budget_id: '', amount: '', description: '' });
      fetchData();
      alert('Expenditure recorded successfully with AI explanation!');
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create expenditure');
    }
  };

  const deleteExpenditure = async (expenditureId) => {
    if (!confirm('Delete this expenditure?')) return;
    try {
      await apiClient.delete(`/super-admin/expenditures/${expenditureId}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete expenditure');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await apiClient.post('/budgets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadResult(response.data);
      setUploadFile(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.background, paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ background: colors.primary, marginBottom: '30px', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ color: colors.white, fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0' }}>
                Super Admin Control Panel
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', margin: '0' }}>
                System-wide management and oversight
              </p>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>OpenGov Kenya</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '0' }}>
          {['overview', 'users', 'sectors', 'budgets', 'expenditures', 'moderation', 'audit'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                background: activeTab === tab ? colors.primary : 'transparent',
                color: activeTab === tab ? colors.white : colors.gray,
                border: 'none',
                borderBottom: activeTab === tab ? `3px solid ${colors.primary}` : '3px solid transparent',
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
            <div style={{ display: 'inline-block', width: '50px', height: '50px', border: `4px solid ${colors.border}`, borderTop: `4px solid ${colors.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && analytics && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ color: colors.gray, fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>TOTAL USERS</div>
                    <div style={{ color: colors.primary, fontSize: '36px', fontWeight: '700' }}>{analytics.total_users}</div>
                    <div style={{ color: colors.lightGray, fontSize: '13px' }}>{analytics.active_users} active</div>
                  </div>
                  <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ color: colors.gray, fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>TOTAL BUDGETS</div>
                    <div style={{ color: colors.info, fontSize: '36px', fontWeight: '700' }}>{analytics.total_budgets}</div>
                    <div style={{ color: colors.lightGray, fontSize: '13px' }}>KSh {analytics.total_budget_amount.toLocaleString()}</div>
                  </div>
                  <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ color: colors.gray, fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>CITIZEN FEEDBACK</div>
                    <div style={{ color: colors.success, fontSize: '36px', fontWeight: '700' }}>{analytics.total_feedback}</div>
                    <div style={{ color: colors.lightGray, fontSize: '13px' }}>Total submissions</div>
                  </div>
                  <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ color: colors.gray, fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>FLAGGED CONTENT</div>
                    <div style={{ color: colors.danger, fontSize: '36px', fontWeight: '700' }}>{analytics.flagged_posts}</div>
                    <div style={{ color: colors.lightGray, fontSize: '13px' }}>Needs review</div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', marginBottom: '20px', margin: '0 0 20px 0' }}>
                    Create New User
                  </h3>
                  <form onSubmit={createUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      style={{ padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      style={{ padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      style={{ padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      style={{ padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="citizen">Citizen</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <button type="submit" style={{ padding: '10px 20px', background: colors.primary, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      Create User
                    </button>
                  </form>
                </div>

                <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: colors.background }}>
                      <tr>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: colors.gray }}>NAME</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: colors.gray }}>EMAIL</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: colors.gray }}>ROLE</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: colors.gray }}>STATUS</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: colors.gray }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <td style={{ padding: '16px 20px', fontSize: '14px', color: colors.dark }}>{user.name}</td>
                          <td style={{ padding: '16px 20px', fontSize: '14px', color: colors.gray }}>{user.email}</td>
                          <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                            <span style={{ padding: '4px 12px', background: user.role === 'super_admin' ? 'rgba(220, 38, 38, 0.1)' : user.role === 'admin' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(2, 132, 199, 0.1)', color: user.role === 'super_admin' ? colors.danger : user.role === 'admin' ? colors.warning : colors.info, borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                            <span style={{ padding: '4px 12px', background: user.is_active ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)', color: user.is_active ? colors.success : colors.danger, borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                            <button onClick={() => toggleUserStatus(user.id, user.is_active)} style={{ marginRight: '8px', padding: '6px 12px', background: colors.warning, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                              {user.is_active ? 'Suspend' : 'Activate'}
                            </button>
                            {user.role !== 'super_admin' && (
                              <button onClick={() => deleteUser(user.id)} style={{ padding: '6px 12px', background: colors.danger, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
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
                <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', marginBottom: '20px', margin: '0 0 20px 0' }}>
                    Add New Ministry Sector
                  </h3>
                  <form onSubmit={createSector} style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1fr', gap: '16px' }}>
                    <input
                      type="text"
                      placeholder="Sector Name (e.g., Agriculture)"
                      value={newSector.name}
                      onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
                      style={{ padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newSector.description}
                      onChange={(e) => setNewSector({ ...newSector, description: e.target.value })}
                      style={{ padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                    />
                    <button type="submit" style={{ padding: '10px 20px', background: colors.primary, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      Add Sector
                    </button>
                  </form>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {sectors.map(sector => (
                    <div key={sector.id} style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                      <h4 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' }}>{sector.name}</h4>
                      <p style={{ color: colors.gray, fontSize: '14px', margin: '0 0 16px 0' }}>{sector.description || 'No description'}</p>
                      <button onClick={() => deleteSector(sector.id)} style={{ padding: '8px 16px', background: colors.danger, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        Delete Sector
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budgets Tab */}
            {activeTab === 'budgets' && (
              <div>
                {/* Budget Upload Section */}
                <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Upload Budget Dataset</h3>
                  <form onSubmit={handleFileUpload}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.darkGray, marginBottom: '8px' }}>
                          Select CSV or XLSX File
                        </label>
                        <input
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={(e) => setUploadFile(e.target.files[0])}
                          style={{ display: 'block', width: '100%', fontSize: '14px', color: colors.dark, border: `1px solid ${colors.border}`, borderRadius: '8px', cursor: 'pointer', background: colors.background, padding: '10px' }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={uploading || !uploadFile}
                        style={{ padding: '10px 24px', background: uploading || !uploadFile ? colors.lightGray : colors.primary, color: colors.white, fontWeight: '600', borderRadius: '8px', border: 'none', cursor: uploading || !uploadFile ? 'not-allowed' : 'pointer', fontSize: '14px', alignSelf: 'flex-start' }}
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </form>

                  {uploadResult && (
                    <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(22, 163, 74, 0.1)', border: `1px solid ${colors.success}`, borderRadius: '8px' }}>
                      <h4 style={{ fontWeight: '600', color: colors.success, marginBottom: '12px', fontSize: '15px' }}>Upload Complete</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '14px' }}>
                        <div>
                          <span style={{ color: colors.gray }}>Inserted:</span>
                          <span style={{ marginLeft: '8px', fontWeight: '700', color: colors.success }}>{uploadResult.inserted}</span>
                        </div>
                        <div>
                          <span style={{ color: colors.gray }}>Updated:</span>
                          <span style={{ marginLeft: '8px', fontWeight: '700', color: colors.info }}>{uploadResult.updated}</span>
                        </div>
                        <div>
                          <span style={{ color: colors.gray }}>Skipped:</span>
                          <span style={{ marginLeft: '8px', fontWeight: '700', color: colors.warning }}>{uploadResult.skipped}</span>
                        </div>
                      </div>

                      {uploadResult.errors && uploadResult.errors.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                          <button
                            onClick={() => setShowErrors(!showErrors)}
                            style={{ fontSize: '13px', color: colors.danger, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            {showErrors ? 'Hide' : 'Show'} {uploadResult.errors.length} Error(s)
                          </button>
                          {showErrors && (
                            <div style={{ marginTop: '12px', maxHeight: '160px', overflowY: 'auto', background: 'rgba(220, 38, 38, 0.05)', border: `1px solid ${colors.danger}`, borderRadius: '6px', padding: '12px' }}>
                              {uploadResult.errors.map((err, idx) => (
                                <div key={idx} style={{ fontSize: '12px', color: colors.danger, marginBottom: '6px' }}>
                                  <span style={{ fontWeight: '600' }}>Row {err.row_index}:</span> {err.reason}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', border: `2px solid ${colors.primary}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                    <h3 style={{ color: colors.primaryDark, fontSize: '18px', fontWeight: '700', margin: '0' }}>AI-Powered Budget Creation</h3>
                  </div>
                  <p style={{ color: colors.primaryDark, fontSize: '14px', margin: '0' }}>When you create a budget, AI automatically generates a citizen-friendly explanation that appears on the dashboard.</p>
                </div>

                <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', marginBottom: '20px', margin: '0 0 20px 0' }}>
                    Create New Budget Allocation
                  </h3>
                  <form onSubmit={createBudget} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 3fr 1fr', gap: '16px' }}>
                    <select
                      value={newBudget.sector_id}
                      onChange={(e) => setNewBudget({ ...newBudget, sector_id: e.target.value })}
                      style={{ padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                      required
                    >
                      <option value="">Select Sector</option>
                      {sectors.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Year"
                      value={newBudget.year}
                      onChange={(e) => setNewBudget({ ...newBudget, year: e.target.value })}
                      style={{ padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Amount (KSh)"
                      value={newBudget.amount}
                      onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                      style={{ padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Description (e.g., Infrastructure development)"
                      value={newBudget.description}
                      onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
                      style={{ padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                    <button type="submit" style={{ padding: '10px 20px', background: colors.primary, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      Create Budget
                    </button>
                  </form>
                </div>

                <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ padding: '24px', borderBottom: `1px solid ${colors.border}` }}>
                    <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>All Budget Allocations</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <select
                        value={budgetFilters.county}
                        onChange={(e) => setBudgetFilters({ ...budgetFilters, county: e.target.value })}
                        style={{ padding: '8px 12px', border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '13px' }}
                      >
                        <option value="">All Counties</option>
                        {[...new Set(budgets.map(b => b.county).filter(Boolean))].sort().map(county => (
                          <option key={county} value={county}>{county}</option>
                        ))}
                      </select>
                      <select
                        value={budgetFilters.year}
                        onChange={(e) => setBudgetFilters({ ...budgetFilters, year: e.target.value })}
                        style={{ padding: '8px 12px', border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '13px' }}
                      >
                        <option value="">All Years</option>
                        {[...new Set(budgets.map(b => b.year).filter(Boolean))].sort((a,b) => b-a).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <select
                        value={budgetFilters.sector}
                        onChange={(e) => setBudgetFilters({ ...budgetFilters, sector: e.target.value })}
                        style={{ padding: '8px 12px', border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '13px' }}
                      >
                        <option value="">All Sectors</option>
                        {[...new Set(budgets.map(b => b.sector_name).filter(Boolean))].sort().map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                      {(budgetFilters.county || budgetFilters.year || budgetFilters.sector) && (
                        <button
                          onClick={() => setBudgetFilters({ county: '', year: '', sector: '' })}
                          style={{ padding: '8px 12px', background: colors.background, color: colors.gray, border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                  {budgets.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: colors.lightGray }}>No budgets created yet</div>
                  ) : (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {budgets.filter(budget => {
                        if (budgetFilters.county && budget.county !== budgetFilters.county) return false;
                        if (budgetFilters.year && budget.year != budgetFilters.year) return false;
                        if (budgetFilters.sector && budget.sector_name !== budgetFilters.sector) return false;
                        return true;
                      }).map(budget => (
                        <div key={budget.id} style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                              <span style={{ padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', color: colors.primary, borderRadius: '6px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>{budget.sector_name}</span>
                              <span style={{ color: colors.gray, fontSize: '14px' }}>Year: {budget.year}</span>
                            </div>
                            <div>
                              <span style={{ color: colors.primary, fontSize: '18px', fontWeight: '700' }}>KSh {budget.amount.toLocaleString()}</span>
                              <button onClick={() => deleteBudget(budget.id)} style={{ marginLeft: '16px', padding: '6px 12px', background: colors.danger, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                Delete
                              </button>
                            </div>
                          </div>
                          <p style={{ color: colors.dark, fontSize: '14px', margin: '0 0 12px 0', fontWeight: '600' }}>{budget.description}</p>
                          {budget.citizen_explanation && (
                            <>
                              <button
                                onClick={() => setExpandedBudget(expandedBudget === budget.id ? null : budget.id)}
                                style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: colors.primary, border: `1px solid ${colors.primary}`, borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                </svg>
                                {expandedBudget === budget.id ? 'Hide' : 'View'} AI Explanation
                              </button>
                              {expandedBudget === budget.id && (
                                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: `1px solid ${colors.primary}`, borderRadius: '8px', padding: '16px', marginTop: '12px' }}>
                                  <p style={{ color: colors.darkGray, fontSize: '13px', margin: '0', whiteSpace: 'pre-line' }}>{budget.citizen_explanation}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Expenditures Tab */}
            {activeTab === 'expenditures' && (
              <div>
                <div style={{ background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)', border: `2px solid ${colors.danger}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <h3 style={{ color: colors.danger, fontSize: '18px', fontWeight: '700', margin: '0' }}>AI-Powered Expenditure Tracking</h3>
                  </div>
                  <p style={{ color: colors.danger, fontSize: '14px', margin: '0' }}>Record spending and AI generates transparent explanations for citizens showing how their tax money is being used.</p>
                </div>

                <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', marginBottom: '20px', margin: '0 0 20px 0' }}>
                    Record New Expenditure
                  </h3>
                  <form onSubmit={createExpenditure} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <select
                      value={newExpenditure.budget_id}
                      onChange={(e) => setNewExpenditure({ ...newExpenditure, budget_id: e.target.value })}
                      style={{ padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                      required
                    >
                      <option value="">Select Budget</option>
                      {budgets.map(b => (
                        <option key={b.id} value={b.id}>{b.sector_name} - {b.year} (KSh {b.amount.toLocaleString()})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Amount Spent (KSh)"
                      value={newExpenditure.amount}
                      onChange={(e) => setNewExpenditure({ ...newExpenditure, amount: e.target.value })}
                      style={{ padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                    <input
                      type="text"
                      placeholder="What was this spent on?"
                      value={newExpenditure.description}
                      onChange={(e) => setNewExpenditure({ ...newExpenditure, description: e.target.value })}
                      style={{ padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                      required
                    />
                    <button type="submit" style={{ padding: '10px 20px', background: colors.danger, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      Record Spending
                    </button>
                  </form>
                </div>

                <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ padding: '24px', borderBottom: `1px solid ${colors.border}` }}>
                    <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0' }}>All Expenditures</h3>
                  </div>
                  {expenditures.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: colors.lightGray }}>No expenditures recorded yet</div>
                  ) : (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {expenditures.map(exp => (
                        <div key={exp.id} style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                              <span style={{ padding: '4px 12px', background: 'rgba(220, 38, 38, 0.1)', color: colors.danger, borderRadius: '6px', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>{exp.sector_name}</span>
                              <span style={{ color: colors.gray, fontSize: '13px' }}>{new Date(exp.date).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span style={{ color: colors.danger, fontSize: '18px', fontWeight: '700' }}>KSh {exp.amount.toLocaleString()}</span>
                              <button onClick={() => deleteExpenditure(exp.id)} style={{ marginLeft: '16px', padding: '6px 12px', background: colors.danger, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                Delete
                              </button>
                            </div>
                          </div>
                          <p style={{ color: colors.dark, fontSize: '14px', margin: '0 0 12px 0', fontWeight: '600' }}>{exp.description}</p>
                          {exp.citizen_explanation && (
                            <>
                              <button
                                onClick={() => setExpandedExpenditure(expandedExpenditure === exp.id ? null : exp.id)}
                                style={{ padding: '6px 12px', background: 'rgba(220, 38, 38, 0.1)', color: colors.danger, border: `1px solid ${colors.danger}`, borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                </svg>
                                {expandedExpenditure === exp.id ? 'Hide' : 'View'} AI Explanation
                              </button>
                              {expandedExpenditure === exp.id && (
                                <div style={{ background: 'rgba(220, 38, 38, 0.05)', border: `1px solid ${colors.danger}`, borderRadius: '8px', padding: '16px', marginTop: '12px' }}>
                                  <p style={{ color: colors.darkGray, fontSize: '13px', margin: '0', whiteSpace: 'pre-line' }}>{exp.citizen_explanation}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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

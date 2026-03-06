import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({ name: '', email: '', role: '', is_active: true });
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/super-admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditData({
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    });
  };

  const handleUpdate = async (userId) => {
    try {
      await apiClient.put(`/super-admin/users/${userId}`, editData);
      setEditingUser(null);
      fetchUsers();
      alert('User updated successfully');
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        await apiClient.delete(`/super-admin/users/${userId}`);
        fetchUsers();
        alert('User deleted successfully');
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleResetPassword = async (userId) => {
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    try {
      await apiClient.post('/auth/admin/reset-user-password', {
        user_id: userId,
        new_password: newPassword
      });
      setResetPasswordUser(null);
      setNewPassword('');
      alert('Password reset successfully');
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert('Failed to reset password');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return { bg: 'rgba(220, 38, 38, 0.1)', color: colors.danger };
      case 'admin':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: colors.warning };
      default:
        return { bg: 'rgba(2, 132, 199, 0.1)', color: colors.info };
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '4px solid ' + colors.border, borderTop: '4px solid ' + colors.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
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
            User Management
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 40px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: colors.dark, marginBottom: '8px' }}>
            User Management
          </h2>
          <p style={{ fontSize: '15px', color: colors.gray }}>
            Manage user roles and permissions
          </p>
        </div>

        <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: colors.background }}>
                  <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                  <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                  <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                  <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid ' + colors.border }}>
                    {editingUser === user.id ? (
                      <>
                        <td style={{ padding: '18px 28px' }}>
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid ' + colors.border, borderRadius: '6px', fontSize: '14px', color: colors.dark }}
                          />
                        </td>
                        <td style={{ padding: '18px 28px' }}>
                          <input
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid ' + colors.border, borderRadius: '6px', fontSize: '14px', color: colors.dark }}
                          />
                        </td>
                        <td style={{ padding: '18px 28px' }}>
                          <select
                            value={editData.role}
                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid ' + colors.border, borderRadius: '6px', fontSize: '14px', color: colors.dark }}
                          >
                            <option value="citizen">Citizen</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: '18px 28px' }}>
                          <select
                            value={editData.is_active}
                            onChange={(e) => setEditData({ ...editData, is_active: e.target.value === 'true' })}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid ' + colors.border, borderRadius: '6px', fontSize: '14px', color: colors.dark }}
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </td>
                        <td style={{ padding: '18px 28px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleUpdate(user.id)}
                              style={{ padding: '6px 12px', background: colors.primary, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              style={{ padding: '6px 12px', background: colors.white, color: colors.gray, border: '1px solid ' + colors.border, borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '18px 28px', color: colors.dark, fontSize: '14px', fontWeight: '600' }}>{user.name}</td>
                        <td style={{ padding: '18px 28px', color: colors.gray, fontSize: '14px' }}>{user.email}</td>
                        <td style={{ padding: '18px 28px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            background: getRoleBadgeColor(user.role).bg,
                            color: getRoleBadgeColor(user.role).color
                          }}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '18px 28px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: user.is_active ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                            color: user.is_active ? colors.success : colors.danger
                          }}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '18px 28px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEdit(user)}
                              style={{ padding: '6px 12px', background: colors.info, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setResetPasswordUser(user.id)}
                              style={{ padding: '6px 12px', background: colors.warning, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Reset Password
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, user.name)}
                              style={{ padding: '6px 12px', background: colors.danger, color: colors.white, border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reset Password Modal */}
        {resetPasswordUser && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: colors.white, borderRadius: '12px', padding: '32px', maxWidth: '450px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.dark, marginBottom: '8px' }}>Reset User Password</h3>
              <p style={{ fontSize: '14px', color: colors.gray, marginBottom: '24px' }}>Enter a new password for this user (minimum 8 characters)</p>
              
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}
              />
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setResetPasswordUser(null); setNewPassword(''); }}
                  style={{ padding: '10px 20px', background: colors.white, color: colors.gray, border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResetPassword(resetPasswordUser)}
                  style={{ padding: '10px 20px', background: colors.primary, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Reset Password
                </button>
              </div>
            </div>
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

export default UserManagement;

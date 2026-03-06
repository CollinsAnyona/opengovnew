import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserRole } from '../auth/authUtils';
import apiClient from '../api/apiClient';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        setUserName(response.data.name.split(' ')[0]);
        setUserRole(response.data.role);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUserName('Guest');
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('ai_chat_history');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <nav style={{ 
        background: '#ffffff', 
        borderBottom: '3px solid #0066cc',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            minHeight: '75px',
            flexWrap: 'wrap',
            gap: 'clamp(8px, 2vw, 16px)'
          }}>
            {/* Logo Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 40px)', minWidth: '200px' }}>
              {isAdmin && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#334155'
                  }}
                >
                  <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '5px', 
                  height: '45px', 
                  background: 'linear-gradient(to bottom, #000000 0%, #dc2626 33%, #059669 66%, #0066cc 100%)', 
                  borderRadius: '3px' 
                }}></div>
                <div>
                  <h1 style={{ 
                    fontSize: 'clamp(16px, 4vw, 20px)', 
                    fontWeight: '700', 
                    color: '#1a1a1a',
                    letterSpacing: '0.3px',
                    margin: 0,
                    lineHeight: '1.2'
                  }}>
                    OpenGov
                  </h1>
                  <p style={{ 
                    fontSize: 'clamp(9px, 2vw, 12px)', 
                    color: '#666',
                    margin: '2px 0 0 0',
                    fontWeight: '500'
                  }}>
                    Budget Transparency Portal
                  </p>
                </div>
              </div>
              
              {/* Navigation Links - Only for Citizens */}
              {!isAdmin && (
              <div style={{ 
                display: 'flex', 
                gap: 'clamp(4px, 1vw, 6px)',
                flexWrap: 'wrap'
              }} className="hide-mobile">
                <Link 
                  to="/dashboard" 
                  style={{
                    padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 20px)',
                    borderRadius: 'clamp(4px, 1vw, 8px)',
                    fontSize: 'clamp(11px, 2.2vw, 15px)',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: isActive('/dashboard') ? '#0066cc' : 'transparent',
                    color: isActive('/dashboard') ? '#ffffff' : '#333333',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/expenditures" 
                  style={{
                    padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 20px)',
                    borderRadius: 'clamp(4px, 1vw, 8px)',
                    fontSize: 'clamp(11px, 2.2vw, 15px)',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: isActive('/expenditures') ? '#0066cc' : 'transparent',
                    color: isActive('/expenditures') ? '#ffffff' : '#333333',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Expenditures
                </Link>
                <Link 
                  to="/ai-assistant" 
                  style={{
                    padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 20px)',
                    borderRadius: 'clamp(4px, 1vw, 8px)',
                    fontSize: 'clamp(11px, 2.2vw, 15px)',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: isActive('/ai-assistant') ? '#059669' : 'transparent',
                    color: isActive('/ai-assistant') ? '#ffffff' : '#333333',
                    whiteSpace: 'nowrap'
                  }}
                >
                  AI Assistant
                </Link>
                <Link 
                  to="/forum" 
                  style={{
                    padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 20px)',
                    borderRadius: 'clamp(4px, 1vw, 8px)',
                    fontSize: 'clamp(11px, 2.2vw, 15px)',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: isActive('/forum') || location.pathname.startsWith('/forum/') ? '#0066cc' : 'transparent',
                    color: isActive('/forum') || location.pathname.startsWith('/forum/') ? '#ffffff' : '#333333',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Forum
                </Link>
                <Link 
                  to="/feedback" 
                  style={{
                    padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 20px)',
                    borderRadius: 'clamp(4px, 1vw, 8px)',
                    fontSize: 'clamp(11px, 2.2vw, 15px)',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: isActive('/feedback') ? '#0066cc' : 'transparent',
                    color: isActive('/feedback') ? '#ffffff' : '#333333',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Feedback
                </Link>
              </div>
              )}
            </div>

            {/* User Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)' }}>
              {userName && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'clamp(6px, 1.5vw, 10px)',
                  padding: 'clamp(4px, 1vw, 8px) clamp(8px, 2vw, 16px)',
                  background: '#f0f4f8',
                  borderRadius: 'clamp(4px, 1vw, 8px)'
                }}>
                  <div style={{
                    width: 'clamp(28px, 6vw, 36px)',
                    height: 'clamp(28px, 6vw, 36px)',
                    borderRadius: '50%',
                    background: '#0066cc',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: 'clamp(12px, 3vw, 16px)'
                  }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ 
                    fontSize: 'clamp(12px, 2.5vw, 15px)', 
                    fontWeight: '600', 
                    color: '#1a1a1a',
                    display: window.innerWidth < 480 ? 'none' : 'inline'
                  }}>
                    {userName}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: 'clamp(6px, 1.5vw, 10px) clamp(12px, 3vw, 20px)',
                  fontSize: 'clamp(11px, 2.5vw, 15px)',
                  fontWeight: '600',
                  color: '#dc2626',
                  background: '#ffffff',
                  border: '2px solid #dc2626',
                  borderRadius: 'clamp(4px, 1vw, 8px)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#dc2626';
                  e.target.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.color = '#dc2626';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar for Admins */}
      {isAdmin && sidebarOpen && (
        <div style={{
          position: 'fixed',
          left: 0,
          top: '75px',
          height: 'calc(100vh - 75px)',
          width: '256px',
          background: '#1e293b',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          zIndex: 40,
          overflowY: 'auto'
        }}>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Citizen Views</div>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', marginBottom: '4px', textDecoration: 'none', background: isActive('/dashboard') ? '#2563eb' : 'transparent', color: isActive('/dashboard') ? '#ffffff' : '#cbd5e1', transition: 'all 0.2s' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Dashboard</span>
            </Link>
            <Link to="/expenditures" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', marginBottom: '4px', textDecoration: 'none', background: isActive('/expenditures') ? '#2563eb' : 'transparent', color: isActive('/expenditures') ? '#ffffff' : '#cbd5e1', transition: 'all 0.2s' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Expenditures</span>
            </Link>
            <Link to="/feedback" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', marginBottom: '4px', textDecoration: 'none', background: isActive('/feedback') ? '#2563eb' : 'transparent', color: isActive('/feedback') ? '#ffffff' : '#cbd5e1', transition: 'all 0.2s' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Feedback</span>
            </Link>
            <Link to="/forum" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', textDecoration: 'none', background: isActive('/forum') || location.pathname.startsWith('/forum/') ? '#2563eb' : 'transparent', color: isActive('/forum') || location.pathname.startsWith('/forum/') ? '#ffffff' : '#cbd5e1', transition: 'all 0.2s' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Forum</span>
            </Link>
            <Link to="/ai-assistant" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', textDecoration: 'none', background: isActive('/ai-assistant') ? '#059669' : 'transparent', color: isActive('/ai-assistant') ? '#ffffff' : '#cbd5e1', transition: 'all 0.2s' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>AI Assistant</span>
            </Link>

            <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', marginTop: '24px' }}>Admin Tools</div>
            {(userRole === 'admin' || userRole === 'super_admin') && (
              <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', marginBottom: '4px', textDecoration: 'none', background: isActive('/admin') ? '#9333ea' : 'transparent', color: isActive('/admin') ? '#ffffff' : '#cbd5e1', transition: 'all 0.2s' }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Admin Panel</span>
              </Link>
            )}
            {userRole === 'super_admin' && (
              <Link to="/super-admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', textDecoration: 'none', background: isActive('/super-admin') ? '#9333ea' : 'transparent', color: isActive('/super-admin') ? '#ffffff' : '#cbd5e1', transition: 'all 0.2s' }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Super Admin</span>
              </Link>
            )}
          </div>
        </div>
      )}

      <main style={{ marginLeft: isAdmin && sidebarOpen ? '256px' : '0', transition: 'margin-left 0.3s' }}>
        {children}
      </main>
      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;

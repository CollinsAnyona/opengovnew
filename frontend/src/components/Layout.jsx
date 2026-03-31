import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserRole } from '../auth/authUtils';
import apiClient from '../api/apiClient';
import '../styles/responsive.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        setUserName(response.data.name.split(' ')[0]);
        setUserRole(response.data.role);
      } catch (error) {
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

  const handleNavClick = () => {
    if (isMobile) setSidebarOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  const linkStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px', borderRadius: '8px', marginBottom: '4px',
    textDecoration: 'none',
    background: active ? '#d1fae5' : 'transparent',
    color: active ? '#059669' : '#6b7280',
    transition: 'all 0.2s',
    border: active ? '1px solid #10b981' : '1px solid transparent',
    fontSize: '14px', fontWeight: '600'
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <nav style={{
        background: '#ffffff',
        borderBottom: '3px solid #0066cc',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(12px, 3vw, 40px)' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', minHeight: '64px', gap: '8px'
          }}>
            {/* Left: Hamburger + Logo + Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              {isAdmin && (
                <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                  padding: '8px', background: 'transparent', border: 'none',
                  cursor: 'pointer', color: '#334155', flexShrink: 0
                }}>
                  <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <div style={{
                  width: '4px', height: '40px',
                  background: 'linear-gradient(to bottom, #000 0%, #dc2626 33%, #059669 66%, #0066cc 100%)',
                  borderRadius: '3px'
                }} />
                <div>
                  <h1 style={{ fontSize: 'clamp(14px, 3.5vw, 20px)', fontWeight: '700', color: '#1a1a1a', margin: 0, lineHeight: '1.2' }}>
                    OpenGov
                  </h1>
                  <p style={{ fontSize: 'clamp(8px, 1.8vw, 11px)', color: '#666', margin: 0, fontWeight: '500', whiteSpace: 'nowrap' }}>
                    Budget Transparency Portal
                  </p>
                </div>
              </div>

              {/* Citizen nav links - hidden on mobile */}
              {!isAdmin && (
                <div className="hide-mobile" style={{ display: 'flex', gap: '2px', flexWrap: 'nowrap', marginLeft: '8px' }}>
                  {[
                    { to: '/dashboard', label: 'Dashboard', active: isActive('/dashboard'), color: '#0066cc' },
                    { to: '/expenditures', label: 'Expenditures', active: isActive('/expenditures'), color: '#0066cc' },
                    { to: '/ai-assistant', label: 'AI Assistant', active: isActive('/ai-assistant'), color: '#059669' },
                    { to: '/forum', label: 'Forum', active: isActive('/forum') || location.pathname.startsWith('/forum/'), color: '#0066cc' },
                    { to: '/feedback', label: 'Feedback', active: isActive('/feedback'), color: '#0066cc' },
                  ].map(({ to, label, active, color }) => (
                    <Link key={to} to={to} style={{
                      padding: 'clamp(5px, 1.2vw, 9px) clamp(6px, 1.5vw, 16px)',
                      borderRadius: '6px', fontSize: 'clamp(11px, 1.8vw, 14px)',
                      fontWeight: '600', textDecoration: 'none',
                      background: active ? color : 'transparent',
                      color: active ? '#fff' : '#333', whiteSpace: 'nowrap'
                    }}>{label}</Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right: User + Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {userName && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 10px', background: '#f0f4f8', borderRadius: '8px'
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#0066cc', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '14px', flexShrink: 0
                  }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hide-mobile" style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                    {userName}
                  </span>
                </div>
              )}
              <button onClick={handleLogout} style={{
                padding: 'clamp(6px, 1.5vw, 9px) clamp(10px, 2vw, 16px)',
                fontSize: 'clamp(11px, 2vw, 14px)', fontWeight: '600',
                color: '#fff', background: '#0066cc',
                border: '2px solid #0066cc', borderRadius: '8px',
                cursor: 'pointer', whiteSpace: 'nowrap'
              }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#0052a3'; e.currentTarget.style.borderColor = '#0052a3'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#0066cc'; e.currentTarget.style.borderColor = '#0066cc'; }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {isAdmin && sidebarOpen && (
        <>
          {isMobile && (
            <div onClick={() => setSidebarOpen(false)} style={{
              position: 'fixed', inset: 0, top: '64px',
              background: 'rgba(0,0,0,0.5)', zIndex: 39
            }} />
          )}
          <div style={{
            position: 'fixed', left: 0, top: '64px',
            height: 'calc(100vh - 64px)',
            width: isMobile ? 'min(80vw, 280px)' : '256px',
            background: '#ffffff', borderRight: '1px solid #e5e7eb',
            boxShadow: isMobile ? '4px 0 20px rgba(0,0,0,0.15)' : '2px 0 8px rgba(0,0,0,0.05)',
            zIndex: 40, overflowY: 'auto'
          }}>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Citizen Views</div>

              {[
                { to: '/dashboard', label: 'Dashboard', active: isActive('/dashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { to: '/expenditures', label: 'Expenditures', active: isActive('/expenditures'), icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { to: '/feedback', label: 'Feedback', active: isActive('/feedback'), icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
                { to: '/forum', label: 'Forum', active: isActive('/forum') || location.pathname.startsWith('/forum/'), icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
                { to: '/ai-assistant', label: 'AI Assistant', active: isActive('/ai-assistant'), icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
              ].map(({ to, label, active, icon }) => (
                <Link key={to} to={to} onClick={handleNavClick} style={linkStyle(active)}>
                  <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                  <span>{label}</span>
                </Link>
              ))}

              <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px' }}>Admin Tools</div>

              {(userRole === 'admin' || userRole === 'super_admin') && [
                { to: '/admin', label: 'Admin Panel', active: isActive('/admin'), icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                { to: '/moderation', label: 'Forum Moderation', active: isActive('/moderation'), icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
                { to: '/feedback-management', label: 'Feedback Management', active: isActive('/feedback-management'), icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
              ].map(({ to, label, active, icon }) => (
                <Link key={to} to={to} onClick={handleNavClick} style={linkStyle(active)}>
                  <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                  <span>{label}</span>
                </Link>
              ))}

              {userRole === 'super_admin' && [
                { to: '/super-admin', label: 'Super Admin', active: isActive('/super-admin'), icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
                { to: '/user-management', label: 'User Management', active: isActive('/user-management'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
              ].map(({ to, label, active, icon }) => (
                <Link key={to} to={to} onClick={handleNavClick} style={linkStyle(active)}>
                  <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <main style={{
        marginLeft: isAdmin && sidebarOpen && !isMobile ? '256px' : '0',
        transition: 'margin-left 0.3s',
        minWidth: 0
      }}>
        {children}
        <footer style={{ borderTop: '1px solid #e5e7eb', padding: '20px 40px', textAlign: 'center', background: '#ffffff', marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <Link to="/privacy-policy" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none' }}>Terms &amp; Conditions</Link>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: '8px 0 0' }}>© 2026 OpenGov Kenya. Built for the people.</p>
        </footer>
      </main>

      <style>{`
        @media (max-width: 768px) { .hide-mobile { display: none !important; } }
      `}</style>
    </div>
  );
};

export default Layout;

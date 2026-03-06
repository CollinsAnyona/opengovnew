import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserRole } from '../auth/authUtils';
import apiClient from '../api/apiClient';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

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

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <nav style={{ 
        background: '#ffffff', 
        borderBottom: '3px solid #0066cc',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
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
              
              {/* Navigation Links - Hidden on mobile */}
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
                {(userRole === 'admin' || userRole === 'super_admin') && (
                  <Link 
                    to="/admin" 
                    style={{
                      padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 20px)',
                      borderRadius: 'clamp(4px, 1vw, 8px)',
                      fontSize: 'clamp(11px, 2.2vw, 15px)',
                      fontWeight: '600',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      background: isActive('/admin') ? '#0066cc' : 'transparent',
                      color: isActive('/admin') ? '#ffffff' : '#333333',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Admin
                  </Link>
                )}
                {userRole === 'super_admin' && (
                  <Link 
                    to="/super-admin" 
                    style={{
                      padding: 'clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 20px)',
                      borderRadius: 'clamp(4px, 1vw, 8px)',
                      fontSize: 'clamp(11px, 2.2vw, 15px)',
                      fontWeight: '600',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      background: isActive('/super-admin') ? '#7c3aed' : 'transparent',
                      color: isActive('/super-admin') ? '#ffffff' : '#333333',
                      border: isActive('/super-admin') ? 'none' : '1px solid #7c3aed',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Super Admin
                  </Link>
                )}
              </div>
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
      <main>
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

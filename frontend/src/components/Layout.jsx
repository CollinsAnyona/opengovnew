import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserRole } from '../auth/authUtils';
import apiClient from '../api/apiClient';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        setUserName(response.data.name.split(' ')[0]);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUserName('Guest');
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
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
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '75px' }}>
            {/* Logo Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '5px', 
                  height: '45px', 
                  background: 'linear-gradient(to bottom, #000000 0%, #dc2626 33%, #059669 66%, #0066cc 100%)', 
                  borderRadius: '3px' 
                }}></div>
                <div>
                  <h1 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#1a1a1a',
                    letterSpacing: '0.3px',
                    margin: 0,
                    lineHeight: '1.2'
                  }}>
                    Republic of Kenya
                  </h1>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    margin: '2px 0 0 0',
                    fontWeight: '500'
                  }}>
                    Budget Transparency Portal
                  </p>
                </div>
              </div>
              
              {/* Navigation Links */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <Link 
                  to="/dashboard" 
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: isActive('/dashboard') ? '#0066cc' : 'transparent',
                    color: isActive('/dashboard') ? '#ffffff' : '#333333'
                  }}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/expenditures" 
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: isActive('/expenditures') ? '#0066cc' : 'transparent',
                    color: isActive('/expenditures') ? '#ffffff' : '#333333'
                  }}
                >
                  Expenditures
                </Link>
                <Link 
                  to="/forum" 
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: isActive('/forum') || location.pathname.startsWith('/forum/') ? '#0066cc' : 'transparent',
                    color: isActive('/forum') || location.pathname.startsWith('/forum/') ? '#ffffff' : '#333333'
                  }}
                >
                  Forum
                </Link>
                <Link 
                  to="/feedback" 
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: isActive('/feedback') ? '#0066cc' : 'transparent',
                    color: isActive('/feedback') ? '#ffffff' : '#333333'
                  }}
                >
                  Feedback
                </Link>
                <Link 
                  to="/admin" 
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: isActive('/admin') ? '#0066cc' : 'transparent',
                    color: isActive('/admin') ? '#ffffff' : '#333333'
                  }}
                >
                  Admin
                </Link>
              </div>
            </div>

            {/* User Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {userName && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  padding: '8px 16px',
                  background: '#f0f4f8',
                  borderRadius: '8px'
                }}>
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
                    fontSize: '16px'
                  }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>
                    {userName}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#dc2626',
                  background: '#ffffff',
                  border: '2px solid #dc2626',
                  borderRadius: '8px',
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
    </div>
  );
};

export default Layout;

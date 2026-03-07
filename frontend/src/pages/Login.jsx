import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    console.log('Form submitted', { email, password });
    setError('');
    setLoading(true);
    
    try {
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('password', password);
      console.log('Sending request to /auth/login');
      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      console.log('Login response received:', response);
      console.log('Response data:', response.data);
      console.log('Access token:', response.data.access_token);
      
      if (response.data && response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        
        // Decode token to get user info
        const token = response.data.access_token;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        localStorage.setItem('user_name', payload.name);
        localStorage.setItem('user_role', payload.role);
        
        console.log('Token saved to localStorage');
        console.log('Navigating to dashboard...');
        // Force a full page reload to ensure token is recognized
        window.location.href = '/dashboard';
      } else {
        console.error('No access token in response');
        setError('Login failed: No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      const detail = error.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail) || 'Login failed');
    } finally {
      setLoading(false);
      console.log('Loading set to false');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.background, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: colors.primary, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 40px' }}>
          <Link to="/" style={{ color: colors.white, fontSize: '20px', fontWeight: '600', textDecoration: 'none' }}>
            OpenGov Kenya
          </Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{
          background: colors.white,
          border: '1px solid ' + colors.border,
          borderRadius: '12px',
          padding: '48px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: '440px'
        }}>
          <h1 style={{ textAlign: 'center', color: colors.dark, marginBottom: '8px', fontSize: '28px', fontWeight: '700' }}>
            Welcome Back
          </h1>
          <p style={{ textAlign: 'center', color: colors.gray, marginBottom: '32px', fontSize: '14px' }}>
            Sign in to track government spending
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: colors.dark }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid ' + colors.border,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  background: colors.white,
                  color: colors.dark
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: colors.dark }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ color: colors.primary, textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid ' + colors.border,
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  background: colors.white,
                  color: colors.dark
                }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%',
              padding: '14px',
              background: colors.primary,
              color: colors.white,
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              opacity: loading ? 0.6 : 1
            }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            {error && <p style={{ color: colors.danger, marginTop: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
          </form>
          <p style={{ textAlign: 'center', marginTop: '24px', color: colors.gray, fontSize: '14px' }}>
            Don't have an account? <Link to="/register" style={{ color: colors.primary, textDecoration: 'none', fontWeight: '600' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

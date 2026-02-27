import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)',
        backgroundSize: '100px 100px',
        opacity: 0.5
      }} />
      
      {/* Gradient Orbs */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }} />

      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '50px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#fff',
          marginBottom: '10px',
          fontSize: '32px',
          fontWeight: '700'
        }}>Welcome Back</h1>
        <p style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '40px',
          fontSize: '14px'
        }}>Sign in to track government spending</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#fff' }}>
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
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#fff'
              }}
            />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#fff' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#fff'
              }}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
            opacity: loading ? 0.6 : 1
          }}>{loading ? 'Signing In...' : 'Sign In'}</button>
          {error && <p style={{ color: '#ef4444', marginTop: '15px', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
        </form>
        <p style={{ textAlign: 'center', marginTop: '25px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

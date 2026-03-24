import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';

const kenyanCounties = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta', 'Garissa', 'Wajir',
  'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos',
  'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot',
  'Samburu', 'Trans-Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia',
  'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia',
  'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'
];

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid ' + colors.border,
  borderRadius: '8px',
  fontSize: '14px',
  boxSizing: 'border-box',
  background: colors.white,
  color: colors.dark
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: '600',
  color: colors.dark
};

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    county: '',
    constituency: '',
    phone: '',
    role: 'citizen',
    acceptedTerms: false
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) {
        navigate('/dashboard');
      } else {
        localStorage.removeItem('access_token');
      }
    } catch {
      localStorage.removeItem('access_token');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Register form submitted');
    setSuccess('');
    setError('');

    if (!formData.acceptedTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      console.log('Sending registration request...');
      const response = await apiClient.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      console.log('Registration successful:', response.data);
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail) || 'Registration failed');
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
          maxWidth: '540px'
        }}>
          <h1 style={{ textAlign: 'center', color: colors.dark, marginBottom: '8px', fontSize: '28px', fontWeight: '700' }}>
            Create Account
          </h1>
          <p style={{ textAlign: 'center', color: colors.gray, marginBottom: '32px', fontSize: '14px' }}>
            Join OpenGov to track government spending
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>County</label>
              <select name="county" value={formData.county} onChange={handleChange} required style={{...inputStyle, cursor: 'pointer'}}>
                <option value="">Select your county</option>
                {kenyanCounties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Phone Number (Optional)</label>
              <input type="tel" name="phone" placeholder="0712345678" value={formData.phone} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Constituency (Optional)</label>
              <input type="text" name="constituency" placeholder="e.g., Westlands, Kibra" value={formData.constituency} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Password</label>
              <input type="password" name="password" placeholder="Minimum 8 characters" value={formData.password} onChange={handleChange} required minLength={8} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" name="confirmPassword" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', fontSize: '14px', color: colors.gray, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="acceptedTerms"
                  checked={formData.acceptedTerms}
                  onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                  required
                  style={{ marginRight: '10px', marginTop: '3px', cursor: 'pointer' }}
                />
                <span>
                  I agree to the <a href="#" style={{ color: colors.primary, textDecoration: 'none' }}>Terms and Conditions</a> and <a href="#" style={{ color: colors.primary, textDecoration: 'none' }}>Privacy Policy</a>
                </span>
              </label>
            </div>

            <button type="submit" style={{
              width: '100%',
              padding: '14px',
              background: colors.primary,
              color: colors.white,
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
            }}>
              Create Account
            </button>

            {success && <p style={{ color: colors.success, marginTop: '16px', fontSize: '14px', textAlign: 'center' }}>{success}</p>}
            {error && <p style={{ color: colors.danger, marginTop: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: colors.gray, fontSize: '14px' }}>
            Already have an account? <Link to="/login" style={{ color: colors.primary, textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

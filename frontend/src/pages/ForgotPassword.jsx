import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: code & new password
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      setSuccess('Reset code sent! Check your email (or console for development).');
      setStep(2);
      // For development - show code in console
      if (response.data.reset_code) {
        console.log('Reset Code:', response.data.reset_code);
        alert(`Development Mode - Reset Code: ${response.data.reset_code}`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        email,
        reset_code: resetCode,
        new_password: newPassword
      });
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: colors.dark, fontSize: '28px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
            Reset Password
          </h1>
          <p style={{ color: colors.gray, fontSize: '14px', marginBottom: '30px', textAlign: 'center' }}>
            {step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code and your new password'}
          </p>

          {step === 1 ? (
            <form onSubmit={handleRequestCode}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', color: colors.dark, boxSizing: 'border-box' }}
                  required
                />
              </div>

              {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid ' + colors.danger, color: colors.danger, borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ padding: '12px 16px', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid ' + colors.success, color: colors.success, borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px', background: loading ? colors.border : colors.primary, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '16px', transition: 'all 0.2s ease', boxShadow: loading ? 'none' : '0 2px 4px rgba(16, 185, 129, 0.2)' }}
                onMouseOver={(e) => !loading && (e.target.style.background = colors.primaryDark)}
                onMouseOut={(e) => !loading && (e.target.style.background = colors.primary)}
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{ width: '100%', padding: '12px', background: colors.white, color: colors.gray, border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseOver={(e) => e.target.style.background = colors.background}
                onMouseOut={(e) => e.target.style.background = colors.white}
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Reset Code
                </label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', color: colors.dark, boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', color: colors.dark, boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '14px', color: colors.dark, boxSizing: 'border-box' }}
                  required
                />
              </div>

              {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid ' + colors.danger, color: colors.danger, borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ padding: '12px 16px', background: 'rgba(22, 163, 74, 0.1)', border: '1px solid ' + colors.success, color: colors.success, borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px', background: loading ? colors.border : colors.primary, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '16px', transition: 'all 0.2s ease', boxShadow: loading ? 'none' : '0 2px 4px rgba(16, 185, 129, 0.2)' }}
                onMouseOver={(e) => !loading && (e.target.style.background = colors.primaryDark)}
                onMouseOut={(e) => !loading && (e.target.style.background = colors.primary)}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ width: '100%', padding: '12px', background: colors.white, color: colors.gray, border: '1px solid ' + colors.border, borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseOver={(e) => e.target.style.background = colors.background}
                onMouseOut={(e) => e.target.style.background = colors.white}
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

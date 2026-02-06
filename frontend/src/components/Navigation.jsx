import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navigation = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  
  let userRole = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role;
    } catch (error) {
      console.error('Invalid token');
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  if (!token) return null;

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/dashboard" style={{ marginRight: '1rem' }}>Dashboard</Link>
      <Link to="/feedback" style={{ marginRight: '1rem' }}>Feedback</Link>
      {userRole === 'admin' && (
        <Link to="/admin" style={{ marginRight: '1rem' }}>Admin</Link>
      )}
      <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>Logout</button>
      <span style={{ marginLeft: '1rem' }}>Role: {userRole}</span>
    </nav>
  );
};

export default Navigation;
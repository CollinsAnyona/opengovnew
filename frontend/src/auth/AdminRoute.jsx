import { Navigate } from 'react-router-dom';
import { getUserRole } from './authUtils';

function AdminRoute({ children }) {
  const token = localStorage.getItem('access_token');
  const userRole = getUserRole();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== 'admin' && userRole !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export default AdminRoute;

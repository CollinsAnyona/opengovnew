import { jwtDecode } from 'jwt-decode';

export const getUserRole = () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.role || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

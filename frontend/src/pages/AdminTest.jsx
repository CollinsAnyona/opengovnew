import { useState, useEffect } from 'react';

const AdminTest = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AdminTest mounted');
    setData('Admin page loaded successfully');
  }, []);

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Admin Test Page
      </h1>
      <p style={{ color: '#059669' }}>{data || 'Loading...'}</p>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
    </div>
  );
};

export default AdminTest;

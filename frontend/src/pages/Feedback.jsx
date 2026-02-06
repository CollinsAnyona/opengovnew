import { useState, useEffect } from 'react';
import apiClient from '../api/client';

const Feedback = () => {
  const [message, setMessage] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [sectors, setSectors] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await apiClient.get('/sectors');
        setSectors(response.data);
        if (response.data.length > 0) {
          setSectorId(response.data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch sectors:', err);
      }
    };
    fetchSectors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      await apiClient.post('/feedback', {
        sector_id: parseInt(sectorId),
        message
      });
      setSuccess('Feedback submitted successfully!');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit feedback');
    }
  };

  return (
    <div>
      <h1>Submit Feedback</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Sector:</label>
          <select 
            value={sectorId} 
            onChange={(e) => setSectorId(e.target.value)}
            required
          >
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your feedback..."
            rows={5}
            required
          />
        </div>

        {success && <div style={{color: 'green'}}>{success}</div>}
        {error && <div style={{color: 'red'}}>{error}</div>}

        <button type="submit">Submit Feedback</button>
      </form>
    </div>
  );
};

export default Feedback;
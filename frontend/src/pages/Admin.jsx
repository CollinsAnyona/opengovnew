import { useState, useEffect } from 'react';
import apiClient from '../api/client';

const Admin = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/feedback');
      setFeedback(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const moderateFeedback = async (feedbackItem) => {
    try {
      const response = await apiClient.post('/ai/moderate', {
        text: feedbackItem.message
      });
      return response.data;
    } catch (err) {
      console.error('Moderation failed:', err);
      return null;
    }
  };

  const handleModerate = async (index, feedbackItem) => {
    const moderation = await moderateFeedback(feedbackItem);
    if (moderation) {
      const updatedFeedback = [...feedback];
      updatedFeedback[index].moderation = moderation;
      setFeedback(updatedFeedback);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div>
      <h1>Admin - Feedback Management</h1>
      
      {feedback.length === 0 ? (
        <div>No feedback found</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Message</th>
              <th>Sector ID</th>
              <th>Status</th>
              <th>Created</th>
              <th>AI Moderation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map((item, index) => (
              <tr key={item.id}>
                <td>{item.message}</td>
                <td>{item.sector_id}</td>
                <td>{item.status}</td>
                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                <td>
                  {item.moderation ? (
                    <div>
                      <div>Clean: {item.moderation.is_clean ? 'Yes' : 'No'}</div>
                      <div>Score: {item.moderation.confidence_score}</div>
                      <div>{item.moderation.summary}</div>
                    </div>
                  ) : (
                    'Not analyzed'
                  )}
                </td>
                <td>
                  {!item.moderation && (
                    <button onClick={() => handleModerate(index, item)}>
                      Moderate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Admin;
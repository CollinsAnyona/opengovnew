import { useState, useEffect } from 'react';
import apiClient from '../api/client';

function Feedback() {
  const [message, setMessage] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [sectors, setSectors] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [moderation, setModeration] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setModeration(null);
    setLoading(true);

    try {
      const feedbackResponse = await apiClient.post('/feedback', {
        sector_id: parseInt(sectorId),
        message
      });

      const moderationResponse = await apiClient.post('/ai/moderate', {
        feedback_id: feedbackResponse.data.id,
        text: message
      });

      setModeration(moderationResponse.data);
      setSuccess('Feedback submitted successfully!');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Citizen Governance Feedback Portal
        </h1>
        <p className="text-gray-600">
          Submit structured feedback to support transparent civic participation and governance accountability
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Feedback</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector
            </label>
            <select 
              value={sectorId} 
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name.charAt(0).toUpperCase() + sector.name.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your feedback regarding governance, budget allocation, or civic concerns..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      {moderation && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Moderation Result</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-3">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                moderation.is_clean 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {moderation.is_clean ? 'Clean' : 'Flagged'}
              </span>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700">AI Summary:</span>
              <p className="text-sm text-gray-600 mt-1">{moderation.summary}</p>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700">Confidence Score:</span>
              <p className="text-sm text-gray-600 mt-1">{moderation.confidence_score}</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
            AI analysis is assistive and subject to human administrative review.
          </p>
        </div>
      )}
    </div>
  );
}

export default Feedback;
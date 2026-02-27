import { useState, useEffect } from 'react';
import apiClient from '../api/client';

const Admin = () => {
  const [feedback, setFeedback] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feedbackRes, analysisRes] = await Promise.all([
        apiClient.get('/feedback'),
        apiClient.get('/ai/analysis')
      ]);
      setFeedback(feedbackRes.data);
      setAiAnalysis(analysisRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisForFeedback = (feedbackId) => {
    return aiAnalysis.find(a => a.feedback_id === feedbackId);
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      submitted: 'bg-yellow-100 text-yellow-800',
      flagged: 'bg-red-100 text-red-800',
      under_review: 'bg-blue-100 text-blue-800',
      escalated: 'bg-orange-100 text-orange-800'
    };
    return styles[status] || styles.submitted;
  };

  const updateStatus = async (feedbackId, newStatus) => {
    try {
      await apiClient.put(`/feedback/${feedbackId}`, { status: newStatus });
      setFeedback(feedback.map(item => 
        item.id === feedbackId ? { ...item, status: newStatus } : item
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-600">Loading...</div>;
  if (error) return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Administrative Oversight Panel
        </h1>
        <p className="text-gray-600">
          Review AI-mediated citizen submissions.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {feedback.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No feedback submissions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Summary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedback.map((item) => {
                  const analysis = getAnalysisForFeedback(item.id);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {item.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.sector_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {analysis ? analysis.summary : 'Not analyzed'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {analysis ? analysis.confidence_score : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button 
                          onClick={() => updateStatus(item.id, 'under_review')}
                          className="text-blue-700 hover:text-blue-800 font-medium"
                        >
                          Mark Reviewed
                        </button>
                        <button 
                          onClick={() => updateStatus(item.id, 'approved')}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => updateStatus(item.id, 'escalated')}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Escalate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
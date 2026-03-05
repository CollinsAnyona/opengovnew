import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api/apiClient';

const Admin = () => {
  const [feedback, setFeedback] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feedbackRes, analysisRes, budgetRes, expRes] = await Promise.all([
        apiClient.get('/feedback'),
        apiClient.get('/ai/analysis'),
        apiClient.get('/budgets'),
        apiClient.get('/expenditures')
      ]);
      setFeedback(feedbackRes.data);
      setAiAnalysis(analysisRes.data);
      setBudgets(budgetRes.data);
      setExpenditures(expRes.data);
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

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = expenditures.reduce((sum, e) => sum + e.amount, 0);
  const utilizationRate = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;
  const flaggedCount = feedback.filter(f => f.status === 'flagged').length;
  const pendingCount = feedback.filter(f => f.status === 'submitted').length;
  const escalatedCount = feedback.filter(f => f.status === 'escalated').length;

  const feedbackByStatus = [
    { name: 'Submitted', value: feedback.filter(f => f.status === 'submitted').length, color: '#0066cc' },
    { name: 'Under Review', value: feedback.filter(f => f.status === 'under_review').length, color: '#f59e0b' },
    { name: 'Approved', value: feedback.filter(f => f.status === 'approved').length, color: '#059669' },
    { name: 'Flagged', value: feedback.filter(f => f.status === 'flagged').length, color: '#dc2626' },
    { name: 'Escalated', value: feedback.filter(f => f.status === 'escalated').length, color: '#991b1b' }
  ].filter(item => item.value > 0);

  return (
    <div>
      {/* Admin AI Analytics Dashboard */}
      {totalBudget > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '2px solid #fbbf24', borderRadius: '12px', padding: '28px', marginBottom: '30px', boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <h3 style={{ color: '#92400e', fontSize: '20px', fontWeight: '700', margin: '0' }}>
              AI Administrative Analytics
            </h3>
          </div>

          {/* Executive Summary */}
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '24px', marginBottom: '20px', border: '2px solid #fde68a' }}>
            <div style={{ color: '#b45309', fontSize: '15px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Executive Summary
            </div>
            <p style={{ color: '#1a1a1a', fontSize: '16px', lineHeight: '1.8', margin: '0 0 16px 0' }}>
              <strong>Budget Performance:</strong> Total allocation of KSh {totalBudget.toLocaleString()} with {utilizationRate}% utilization rate (KSh {totalSpent.toLocaleString()} spent). 
              {utilizationRate < 40 
                ? ' ⚠️ ALERT: Spending is significantly below target. Immediate action required to accelerate project implementation.'
                : utilizationRate < 70
                ? ' ✅ Budget execution is on track with planned disbursement schedule.'
                : utilizationRate < 95
                ? ' ⚡ High utilization rate. Begin planning for next fiscal year allocation.'
                : ' 🚨 CRITICAL: Budget nearly exhausted. Ensure no overspending occurs.'}
            </p>
            <p style={{ color: '#1a1a1a', fontSize: '16px', lineHeight: '1.8', margin: '0' }}>
              <strong>Citizen Engagement:</strong> {feedback.length} total submissions received. 
              {pendingCount > 0 && `${pendingCount} pending review. `}
              {flaggedCount > 0 && `⚠️ ${flaggedCount} flagged by AI for immediate attention. `}
              {escalatedCount > 0 && `🚨 ${escalatedCount} escalated issues requiring urgent action.`}
            </p>
          </div>

          {/* Admin Action Items */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '20px', border: '1px solid #fde68a' }}>
              <div style={{ color: '#dc2626', fontSize: '15px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Priority Alerts
              </div>
              <ul style={{ color: '#666', fontSize: '14px', lineHeight: '1.7', margin: '0', paddingLeft: '20px' }}>
                {utilizationRate < 30 && <li>Low budget utilization - review project delays</li>}
                {flaggedCount > 0 && <li>{flaggedCount} AI-flagged submissions need review</li>}
                {escalatedCount > 0 && <li>{escalatedCount} escalated issues require action</li>}
                {utilizationRate > 95 && <li>Budget nearly exhausted - monitor spending</li>}
                {feedback.length === 0 && <li>No citizen feedback - improve engagement</li>}
              </ul>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '20px', border: '1px solid #fde68a' }}>
              <div style={{ color: '#0066cc', fontSize: '15px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Recommendations
              </div>
              <ul style={{ color: '#666', fontSize: '14px', lineHeight: '1.7', margin: '0', paddingLeft: '20px' }}>
                {utilizationRate < 50 && <li>Accelerate project approvals and disbursements</li>}
                {pendingCount > 5 && <li>Review {pendingCount} pending citizen submissions</li>}
                {feedback.length > 20 && <li>Analyze feedback trends for policy insights</li>}
                <li>Publish quarterly transparency reports</li>
                <li>Engage with citizens through forum discussions</li>
              </ul>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '20px', border: '1px solid #fde68a' }}>
              <div style={{ color: '#059669', fontSize: '15px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M16 12l-4-4-4 4M12 16V8"></path>
                </svg>
                Performance Metrics
              </div>
              <div style={{ color: '#666', fontSize: '14px', lineHeight: '1.9', margin: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Budget Utilization:</span>
                  <strong style={{ color: utilizationRate < 40 ? '#dc2626' : utilizationRate < 80 ? '#059669' : '#f59e0b' }}>{utilizationRate}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Citizen Submissions:</span>
                  <strong>{feedback.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Pending Reviews:</span>
                  <strong style={{ color: pendingCount > 10 ? '#dc2626' : '#666' }}>{pendingCount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Response Rate:</span>
                  <strong>{feedback.length > 0 ? Math.round((feedback.filter(f => f.status !== 'submitted').length / feedback.length) * 100) : 0}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div style={{ background: '#fffbeb', borderRadius: '8px', padding: '16px', border: '1px solid #fde68a', display: 'flex', gap: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
              <path d="M12 2v10l8.66 5"></path>
            </svg>
            <div>
              <div style={{ color: '#92400e', fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>AI-Powered Insights</div>
              <p style={{ color: '#78350f', fontSize: '13px', lineHeight: '1.6', margin: '0' }}>
                Based on current data patterns, the AI recommends: 
                {utilizationRate < 50 ? ' Focus on removing bottlenecks in project approval processes.' : ''}
                {flaggedCount > 3 ? ` Investigate the ${flaggedCount} flagged submissions for potential systemic issues.` : ''}
                {feedback.length > 50 ? ' Consider implementing automated categorization for high-volume feedback.' : ''}
                {' Monitor citizen sentiment trends to proactively address concerns before escalation.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Status Chart */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
          Citizen Feedback Status Overview
        </h3>
        {feedbackByStatus.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={feedbackByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {feedbackByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>No feedback data available</div>
        )}
      </div>

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
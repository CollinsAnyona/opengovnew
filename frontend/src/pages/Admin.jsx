import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';

const Admin = () => {
  const [feedback, setFeedback] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feedbackRes, analysisRes, budgetRes, expRes] = await Promise.all([
        apiClient.get('/feedback').catch(() => ({ data: [] })),
        apiClient.get('/ai/analysis').catch(() => ({ data: [] })),
        apiClient.get('/budgets').catch(() => ({ data: [] })),
        apiClient.get('/expenditures').catch(() => ({ data: [] }))
      ]);
      console.log('Feedback data:', feedbackRes.data);
      console.log('AI Analysis data:', analysisRes.data);
      setFeedback(feedbackRes.data || []);
      setAiAnalysis(analysisRes.data || []);
      setBudgets(budgetRes.data || []);
      setExpenditures(expRes.data || []);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTop: `4px solid ${colors.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: colors.gray, fontSize: '16px' }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ color: colors.danger, fontSize: '16px', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={fetchData}
            style={{ background: colors.primary, color: '#ffffff', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalSpent = expenditures.reduce((sum, e) => sum + (e.amount || 0), 0);
  const utilizationRate = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;
  const flaggedCount = feedback.filter(f => f.status === 'flagged').length;
  const pendingCount = feedback.filter(f => f.status === 'submitted').length;
  const escalatedCount = feedback.filter(f => f.status === 'escalated').length;

  const feedbackByStatus = [
    { name: 'Submitted', value: feedback.filter(f => f.status === 'submitted').length, color: colors.primary },
    { name: 'Under Review', value: feedback.filter(f => f.status === 'under_review').length, color: colors.warning },
    { name: 'Approved', value: feedback.filter(f => f.status === 'approved').length, color: colors.success },
    { name: 'Flagged', value: feedback.filter(f => f.status === 'flagged').length, color: colors.danger },
    { name: 'Escalated', value: feedback.filter(f => f.status === 'escalated').length, color: '#991b1b' }
  ].filter(item => item.value > 0);

  return (
    <div style={{ minHeight: '100vh', background: colors.background }}>
      {/* Header - eCitizen style */}
      <div style={{ background: colors.primary, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: colors.white, fontSize: '20px', fontWeight: '600', margin: '0' }}>
              OpenGov Kenya
            </h1>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
            Admin Panel
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 40px' }}>

        {/* Admin AI Analytics Dashboard */}
        {totalBudget > 0 && (
          <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '28px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, ' + colors.primary + ' 0%, ' + colors.primaryDark + ' 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <div>
                <h3 style={{ color: colors.dark, fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>
                  AI Administrative Analytics
                </h3>
                <p style={{ color: colors.gray, fontSize: '14px', margin: '0' }}>AI-powered insights for administrators</p>
              </div>
            </div>

            {/* Executive Summary */}
            <div style={{ background: colors.background, borderRadius: '12px', padding: '24px', marginBottom: '20px', border: '1px solid ' + colors.border }}>
              <div style={{ color: colors.primary, fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                Executive Summary
              </div>
              <p style={{ color: colors.dark, fontSize: '15px', lineHeight: '1.8', margin: '0 0 16px 0' }}>
              <strong>Budget Performance:</strong> Total allocation of KSh {totalBudget.toLocaleString()} with {utilizationRate}% utilization rate (KSh {totalSpent.toLocaleString()} spent). 
              {utilizationRate < 40 
                ? ' ⚠️ ALERT: Spending is significantly below target. Immediate action required to accelerate project implementation.'
                : utilizationRate < 70
                ? ' ✅ Budget execution is on track with planned disbursement schedule.'
                : utilizationRate < 95
                ? ' ⚡ High utilization rate. Begin planning for next fiscal year allocation.'
                : ' 🚨 CRITICAL: Budget nearly exhausted. Ensure no overspending occurs.'}
            </p>
              <p style={{ color: colors.dark, fontSize: '15px', lineHeight: '1.8', margin: '0' }}>
              <strong>Citizen Engagement:</strong> {feedback.length} total submissions received. 
              {pendingCount > 0 && `${pendingCount} pending review. `}
              {flaggedCount > 0 && `⚠️ ${flaggedCount} flagged by AI for immediate attention. `}
              {escalatedCount > 0 && `🚨 ${escalatedCount} escalated issues requiring urgent action.`}
              </p>
            </div>

            {/* Admin Action Items */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: colors.background, borderRadius: '12px', padding: '20px', border: '1px solid ' + colors.border }}>
                <div style={{ color: colors.danger, fontSize: '15px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  Priority Alerts
                </div>
                <ul style={{ color: colors.gray, fontSize: '14px', lineHeight: '1.7', margin: '0', paddingLeft: '20px' }}>
                {utilizationRate < 30 && <li>Low budget utilization - review project delays</li>}
                {flaggedCount > 0 && <li>{flaggedCount} AI-flagged submissions need review</li>}
                {escalatedCount > 0 && <li>{escalatedCount} escalated issues require action</li>}
                {utilizationRate > 95 && <li>Budget nearly exhausted - monitor spending</li>}
                {feedback.length === 0 && <li>No citizen feedback - improve engagement</li>}
                </ul>
              </div>

              <div style={{ background: colors.background, borderRadius: '12px', padding: '20px', border: '1px solid ' + colors.border }}>
                <div style={{ color: colors.info, fontSize: '15px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.info} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Recommendations
                </div>
                <ul style={{ color: colors.gray, fontSize: '14px', lineHeight: '1.7', margin: '0', paddingLeft: '20px' }}>
                {utilizationRate < 50 && <li>Accelerate project approvals and disbursements</li>}
                {pendingCount > 5 && <li>Review {pendingCount} pending citizen submissions</li>}
                {feedback.length > 20 && <li>Analyze feedback trends for policy insights</li>}
                <li>Publish quarterly transparency reports</li>
                <li>Engage with citizens through forum discussions</li>
                </ul>
              </div>

              <div style={{ background: colors.background, borderRadius: '12px', padding: '20px', border: '1px solid ' + colors.border }}>
                <div style={{ color: colors.success, fontSize: '15px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16 12l-4-4-4 4M12 16V8"></path>
                  </svg>
                  Performance Metrics
                </div>
                <div style={{ color: colors.gray, fontSize: '14px', lineHeight: '1.9', margin: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Budget Utilization:</span>
                  <strong style={{ color: utilizationRate < 40 ? colors.danger : utilizationRate < 80 ? colors.success : colors.warning }}>{utilizationRate}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Citizen Submissions:</span>
                  <strong>{feedback.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Pending Reviews:</span>
                  <strong style={{ color: pendingCount > 10 ? colors.danger : colors.darkGray }}>{pendingCount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Response Rate:</span>
                  <strong>{feedback.length > 0 ? Math.round((feedback.filter(f => f.status !== 'submitted').length / feedback.length) * 100) : 0}%</strong>
                </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div style={{ padding: '14px 16px', background: colors.white, borderLeft: '3px solid ' + colors.primary, borderRadius: '8px', display: 'flex', gap: '12px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div>
                <div style={{ color: colors.darkGray, fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>AI-Powered Insights</div>
                <p style={{ color: colors.darkGray, fontSize: '14px', lineHeight: '1.6', margin: '0', fontWeight: '500' }}>
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
        <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '28px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>
              Citizen Feedback Status Overview
            </h3>
            <p style={{ color: colors.gray, fontSize: '13px', margin: '0' }}>Distribution of feedback by status</p>
          </div>
          {feedbackByStatus.length > 0 ? (
            <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
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
                <Tooltip contentStyle={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: colors.lightGray }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 12l-4-4-4 4M12 16V8"></path>
              </svg>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No feedback data available</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Admin;

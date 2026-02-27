import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api/apiClient';

function Dashboard() {
  const [sector, setSector] = useState('education');
  const [budgets, setBudgets] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [budgetRes, expRes, feedbackRes] = await Promise.all([
          apiClient.get(`/budgets?sector=${sector}`),
          apiClient.get('/expenditures'),
          apiClient.get('/feedback')
        ]);
        setBudgets(budgetRes.data);
        setExpenditures(expRes.data);
        setFeedback(feedbackRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setBudgets([]);
        setExpenditures([]);
        setFeedback([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sector]);

  const getTotalBudget = () => budgets.reduce((sum, b) => sum + b.amount, 0);
  const getTotalSpent = () => {
    const budgetIds = budgets.map(b => b.id);
    return expenditures
      .filter(e => budgetIds.includes(e.budget_id))
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const feedbackByStatus = [
    { name: 'Submitted', value: feedback.filter(f => f.status === 'submitted').length, color: '#0066cc' },
    { name: 'Under Review', value: feedback.filter(f => f.status === 'under_review').length, color: '#f59e0b' },
    { name: 'Approved', value: feedback.filter(f => f.status === 'approved').length, color: '#059669' },
    { name: 'Flagged', value: feedback.filter(f => f.status === 'flagged').length, color: '#dc2626' },
    { name: 'Escalated', value: feedback.filter(f => f.status === 'escalated').length, color: '#991b1b' }
  ].filter(item => item.value > 0);

  const budgetChartData = budgets.map(b => ({
    year: b.year,
    budget: b.amount,
    spent: expenditures
      .filter(e => e.budget_id === b.id)
      .reduce((sum, e) => sum + e.amount, 0)
  }));

  const totalBudget = getTotalBudget();
  const totalSpent = getTotalSpent();
  const remaining = totalBudget - totalSpent;
  const utilizationRate = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '4px solid #e5e7eb', borderTop: '4px solid #0066cc', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#666', marginTop: '16px', fontSize: '16px', fontWeight: '500' }}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', marginBottom: '30px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 40px' }}>
          <h1 style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
            Budget Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '15px', margin: '0' }}>
            Track government spending and citizen feedback in real-time
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
        {/* Sector Selector */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
            Select Ministry Sector
          </label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            style={{ 
              width: '100%', 
              maxWidth: '350px', 
              padding: '12px 16px', 
              background: '#ffffff', 
              border: '2px solid #d1d5db', 
              borderRadius: '8px', 
              color: '#1a1a1a', 
              fontSize: '15px', 
              fontWeight: '500', 
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="education">Ministry of Education</option>
            <option value="health">Ministry of Health</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#666', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Budget</div>
            <div style={{ color: '#0066cc', fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>KSh {totalBudget.toLocaleString()}</div>
            <div style={{ color: '#999', fontSize: '13px' }}>Allocated for FY 2024/2025</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#666', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expenditure</div>
            <div style={{ color: '#dc2626', fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>KSh {totalSpent.toLocaleString()}</div>
            <div style={{ color: '#999', fontSize: '13px' }}>Amount spent to date</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#666', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available</div>
            <div style={{ color: '#059669', fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>KSh {remaining.toLocaleString()}</div>
            <div style={{ color: '#999', fontSize: '13px' }}>Remaining balance</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#666', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Utilization</div>
            <div style={{ color: '#7c3aed', fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>{utilizationRate}%</div>
            <div style={{ color: '#999', fontSize: '13px' }}>Budget execution rate</div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '30px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '700', marginBottom: '20px', margin: '0 0 20px 0' }}>
              Budget vs Expenditure
            </h3>
            {budgetChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="year" stroke="#666" style={{ fontSize: '13px' }} />
                  <YAxis stroke="#666" style={{ fontSize: '13px' }} />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    formatter={(value) => `KSh ${value.toLocaleString()}`} 
                  />
                  <Legend />
                  <Bar dataKey="budget" fill="#0066cc" name="Budget" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="spent" fill="#dc2626" name="Spent" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>No budget data available</div>
            )}
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '700', marginBottom: '20px', margin: '0 0 20px 0' }}>
              Citizen Feedback Status
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
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>No feedback data available</div>
            )}
          </div>
        </div>

        {/* Budget Details Table */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '700', margin: '0' }}>
              Budget Breakdown
            </h3>
          </div>
          {budgets.length === 0 ? (
            <div style={{ padding: '60px 28px', textAlign: 'center', color: '#999' }}>No budget data available for this sector</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '16px 28px', textAlign: 'left', color: '#666', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Year</th>
                    <th style={{ padding: '16px 28px', textAlign: 'left', color: '#666', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                    <th style={{ padding: '16px 28px', textAlign: 'left', color: '#666', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((budget, idx) => (
                    <tr key={budget.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '18px 28px', color: '#1a1a1a', fontSize: '15px', fontWeight: '600' }}>{budget.year}</td>
                      <td style={{ padding: '18px 28px', color: '#059669', fontSize: '15px', fontWeight: '700' }}>KSh {budget.amount.toLocaleString()}</td>
                      <td style={{ padding: '18px 28px', color: '#666', fontSize: '14px' }}>{budget.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
}

export default Dashboard;

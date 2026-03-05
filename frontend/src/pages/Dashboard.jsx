import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api/apiClient';

function Dashboard() {
  const [sector, setSector] = useState('');
  const [county, setCounty] = useState('');
  const [year, setYear] = useState('');
  const [sectors, setSectors] = useState([]);
  const [counties, setCounties] = useState([]);
  const [years, setYears] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [budgetAnalytics, setBudgetAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await apiClient.get('/sectors');
        setSectors(response.data);
        if (response.data.length > 0 && !sector) {
          setSector(response.data[0].name);
        }
      } catch (error) {
        console.error('Failed to fetch sectors:', error);
      }
    };
    fetchSectors();
  }, []);

  useEffect(() => {
    if (!sector) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // First fetch all budgets for the sector to get filter options
        let allBudgetsUrl = `/budgets?sector=${sector}`;
        console.log('Fetching all budgets from:', allBudgetsUrl);
        const allBudgetsRes = await apiClient.get(allBudgetsUrl);
        console.log('All budgets response:', allBudgetsRes.data);
        
        // Extract unique counties and years from ALL budgets
        const uniqueCounties = [...new Set(allBudgetsRes.data.map(b => b.county).filter(c => c))];
        setCounties(uniqueCounties.sort());
        console.log('Counties:', uniqueCounties);
        
        const uniqueYears = [...new Set(allBudgetsRes.data.map(b => b.year))].sort((a, b) => b - a);
        setYears(uniqueYears);
        console.log('Years:', uniqueYears);
        
        // Now fetch filtered data
        let budgetUrl = `/budgets?sector=${sector}`;
        if (county) budgetUrl += `&county=${county}`;
        if (year) budgetUrl += `&year=${year}`;
        console.log('Fetching filtered budgets from:', budgetUrl);
        
        const [budgetRes, expRes, feedbackRes] = await Promise.all([
          apiClient.get(budgetUrl),
          apiClient.get('/expenditures'),
          apiClient.get('/feedback')
        ]);
        console.log('Filtered budgets:', budgetRes.data);
        console.log('Expenditures:', expRes.data);
        setBudgets(budgetRes.data);
        setExpenditures(expRes.data);
        setFeedback(feedbackRes.data);
        
        // Fetch analytics separately (non-blocking)
        try {
          const analyticsRes = await apiClient.get(`/budgets/analytics?sector=${sector}`);
          setBudgetAnalytics(analyticsRes.data);
        } catch (analyticsError) {
          console.error('Analytics failed (non-critical):', analyticsError);
          setBudgetAnalytics(null);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setBudgets([]);
        setExpenditures([]);
        setFeedback([]);
        setBudgetAnalytics(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sector, county, year]);

  const getTotalBudget = () => {
    const total = budgets.reduce((sum, b) => sum + b.amount, 0);
    console.log('Total Budget calculated:', total, 'from', budgets.length, 'budgets');
    return total;
  };
  const getTotalSpent = () => {
    const budgetIds = budgets.map(b => b.id);
    const total = expenditures
      .filter(e => budgetIds.includes(e.budget_id))
      .reduce((sum, e) => sum + e.amount, 0);
    console.log('Total Spent calculated:', total, 'from', expenditures.length, 'expenditures');
    return total;
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

  // Convert yearly_distribution object to array for LineChart
  const trendData = budgetAnalytics?.yearly_distribution 
    ? Object.entries(budgetAnalytics.yearly_distribution).map(([year, amount]) => ({
        year: parseInt(year),
        amount: amount
      })).sort((a, b) => a.year - b.year)
    : [];

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
            {sectors.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filters Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {/* Year Filter */}
          {years.length > 0 && (
            <div>
              <label style={{ display: 'block', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
                Filter by Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{ 
                  width: '100%', 
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
                <option value="">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {/* County Filter */}
          {counties.length > 0 && (
            <div>
              <label style={{ display: 'block', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
                Filter by County
              </label>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                style={{ 
                  width: '100%', 
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
                <option value="">All Counties</option>
                {counties.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Budget</div>
            <div style={{ color: '#0066cc', fontSize: '24px', fontWeight: '700', marginBottom: '4px', wordBreak: 'break-word' }}>KSh {totalBudget.toLocaleString()}</div>
            <div style={{ color: '#999', fontSize: '12px' }}>Allocated for FY 2024/2025</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expenditure</div>
            <div style={{ color: '#dc2626', fontSize: '24px', fontWeight: '700', marginBottom: '4px', wordBreak: 'break-word' }}>KSh {totalSpent.toLocaleString()}</div>
            <div style={{ color: '#999', fontSize: '12px' }}>Amount spent to date</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available</div>
            <div style={{ color: '#059669', fontSize: '24px', fontWeight: '700', marginBottom: '4px', wordBreak: 'break-word' }}>KSh {remaining.toLocaleString()}</div>
            <div style={{ color: '#999', fontSize: '12px' }}>Remaining balance</div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#666', fontSize: '12px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Utilization</div>
            <div style={{ color: '#7c3aed', fontSize: '24px', fontWeight: '700', marginBottom: '4px', wordBreak: 'break-word' }}>{utilizationRate}%</div>
            <div style={{ color: '#999', fontSize: '12px' }}>Budget execution rate</div>
          </div>
        </div>

        {/* Budget Allocation Trend */}
        {trendData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Budget Allocation Trend Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="year" 
                  stroke="#64748b" 
                  style={{ fontSize: '13px', fontWeight: 600 }} 
                />
                <YAxis 
                  stroke="#64748b" 
                  style={{ fontSize: '13px', fontWeight: 600 }}
                  tickFormatter={(value) => `KSh ${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                  }}
                  formatter={(value) => [`KSh ${value.toLocaleString()}`, 'Allocation']}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#1e40af" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  name="Budget Allocation"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* AI Summary Section - Citizen Version */}
        {totalBudget > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', border: '2px solid #93c5fd', borderRadius: '12px', padding: '28px', marginBottom: '30px', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <h3 style={{ color: '#1e40af', fontSize: '20px', fontWeight: '700', margin: '0' }}>
                Understanding Your Government Budget
              </h3>
            </div>
            
            {/* Main Explanation */}
            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '24px', marginBottom: '20px', border: '2px solid #bfdbfe' }}>
              <div style={{ color: '#0066cc', fontSize: '15px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                What This Means For You
              </div>
              <p style={{ color: '#1a1a1a', fontSize: '17px', lineHeight: '1.9', margin: '0 0 16px 0' }}>
                The government has allocated <strong style={{ color: '#0066cc' }}>KSh {totalBudget.toLocaleString()}</strong> for the {sector === 'education' ? 'Ministry of Education' : 'Ministry of Health'} this fiscal year. 
                {utilizationRate < 50 
                  ? ` So far, only KSh ${totalSpent.toLocaleString()} (${utilizationRate}%) has been spent. This means KSh ${remaining.toLocaleString()} is still available for ${sector} services in your community.`
                  : utilizationRate < 80
                  ? ` Currently, KSh ${totalSpent.toLocaleString()} (${utilizationRate}%) has been used for ${sector} programs. There is still KSh ${remaining.toLocaleString()} remaining to serve citizens.`
                  : ` Most of the budget has been utilized - KSh ${totalSpent.toLocaleString()} (${utilizationRate}%) has been spent, leaving KSh ${remaining.toLocaleString()} for the rest of the year.`
                }
              </p>
              <div style={{ padding: '12px 16px', background: '#f0f9ff', borderLeft: '4px solid #0066cc', borderRadius: '4px', display: 'flex', gap: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <p style={{ color: '#1e40af', fontSize: '14px', margin: '0', fontWeight: '500' }}>
                  <strong>Transparency Note:</strong> This budget comes from your taxes and is meant to improve {sector === 'education' ? 'schools, teachers, and learning materials' : 'hospitals, healthcare workers, and medical services'} across Kenya.
                </p>
              </div>
            </div>

            {/* Citizen Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#ffffff', borderRadius: '8px', padding: '20px', border: '1px solid #e0e7ff' }}>
                <div style={{ color: '#059669', fontSize: '15px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Budget Status
                </div>
                <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: '0' }}>
                  {utilizationRate < 30 
                    ? 'Spending is low. The government should speed up project implementation to serve citizens better.'
                    : utilizationRate < 70
                    ? 'Budget execution is on track. Funds are being used as planned throughout the year.'
                    : utilizationRate < 90
                    ? 'Most funds have been used. The government is actively delivering services with the allocated budget.'
                    : 'Budget is nearly exhausted. Planning for next fiscal year should begin soon.'}
                </p>
              </div>
              
              <div style={{ background: '#ffffff', borderRadius: '8px', padding: '20px', border: '1px solid #e0e7ff' }}>
                <div style={{ color: '#0066cc', fontSize: '15px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Your Voice Matters
                </div>
                <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: '0' }}>
                  {feedback.length === 0
                    ? 'No citizen feedback yet. Be the first to share your thoughts on how this budget is being used in your area!'
                    : `${feedback.length} citizens have already shared feedback. Join the conversation and help improve government accountability!`}
                </p>
              </div>
              
              <div style={{ background: '#ffffff', borderRadius: '8px', padding: '20px', border: '1px solid #e0e7ff' }}>
                <div style={{ color: '#7c3aed', fontSize: '15px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Take Action
                </div>
                <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.7', margin: '0 0 12px 0' }}>
                  You can help ensure this money serves your community well. Share your observations and concerns.
                </p>
                <button
                  onClick={() => window.location.href = '/feedback'}
                  style={{ padding: '8px 16px', background: '#0066cc', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}

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

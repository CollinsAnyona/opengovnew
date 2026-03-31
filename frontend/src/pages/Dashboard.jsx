import { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';

function Dashboard() {
  const [sector, setSector] = useState('');
  const [county, setCounty] = useState('');
  const [year, setYear] = useState('');
  const [tableCounty, setTableCounty] = useState('');
  const [tableYear, setTableYear] = useState('');
  const [sectors, setSectors] = useState([]);
  const [counties, setCounties] = useState([]);
  const [years, setYears] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [tableBudgets, setTableBudgets] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [budgetAnalytics, setBudgetAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'
  const [showTrendChart, setShowTrendChart] = useState(true);
  const [showInsights, setShowInsights] = useState(false);

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

  // Fetch filter options only once per sector
  useEffect(() => {
    if (!sector) return;
    const fetchFilterOptions = async () => {
      try {
        const allBudgetsRes = await apiClient.get(`/budgets?sector=${sector}`);
        const uniqueCounties = [...new Set(allBudgetsRes.data.map(b => b.county).filter(c => c))];
        setCounties(uniqueCounties.sort());
        const uniqueYears = [...new Set(allBudgetsRes.data.map(b => b.year))].sort((a, b) => b - a);
        setYears(uniqueYears);
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      }
    };
    fetchFilterOptions();
  }, [sector]);

  // Fetch data only when filters are applied
  useEffect(() => {
    if (!sector) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        let budgetUrl = `/budgets?sector=${sector}`;
        if (county) budgetUrl += `&county=${county}`;
        if (year) budgetUrl += `&year=${year}`;
        
        const budgetRes = await apiClient.get(budgetUrl);
        setBudgets(budgetRes.data);
        
        // Only fetch expenditures for the filtered budgets
        const budgetIds = budgetRes.data.map(b => b.id);
        if (budgetIds.length > 0) {
          const expRes = await apiClient.get('/expenditures');
          setExpenditures(expRes.data.filter(e => budgetIds.includes(e.budget_id)));
        } else {
          setExpenditures([]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setBudgets([]);
        setExpenditures([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sector, county, year]);

  // Fetch table data independently
  useEffect(() => {
    if (!sector || (!tableYear && !tableCounty)) {
      setTableBudgets([]);
      return;
    }
    
    const fetchTableData = async () => {
      try {
        let budgetUrl = `/budgets?sector=${sector}`;
        if (tableCounty) budgetUrl += `&county=${tableCounty}`;
        if (tableYear) budgetUrl += `&year=${tableYear}`;
        
        const budgetRes = await apiClient.get(budgetUrl);
        setTableBudgets(budgetRes.data);
      } catch (error) {
        console.error('Failed to fetch table data:', error);
        setTableBudgets([]);
      }
    };
    fetchTableData();
  }, [sector, tableCounty, tableYear]);

  // Fetch feedback and analytics once on mount
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const feedbackRes = await apiClient.get('/feedback');
        setFeedback(feedbackRes.data);
        
        if (sector) {
          const analyticsRes = await apiClient.get(`/budgets/analytics?sector=${sector}`);
          setBudgetAnalytics(analyticsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch static data:', error);
      }
    };
    fetchStaticData();
  }, [sector]);

  const getTotalBudget = useMemo(() => budgets.reduce((sum, b) => sum + b.amount, 0), [budgets]);
  const getTotalSpent = useMemo(() => expenditures.reduce((sum, e) => sum + e.amount, 0), [expenditures]);

  // Group budgets by county and year for stacked bar chart
  const countyYearData = {};
  const allYears = new Set();
  
  budgets.forEach(b => {
    const countyName = b.county || 'Unspecified';
    const year = b.year;
    allYears.add(year);
    
    if (!countyYearData[countyName]) {
      countyYearData[countyName] = { name: countyName };
    }
    countyYearData[countyName][year] = (countyYearData[countyName][year] || 0) + b.amount;
  });
  
  const budgetByCounty = Object.values(countyYearData).sort((a, b) => {
    const totalA = Object.keys(a).filter(k => k !== 'name').reduce((sum, k) => sum + a[k], 0);
    const totalB = Object.keys(b).filter(k => k !== 'name').reduce((sum, k) => sum + b[k], 0);
    return totalB - totalA;
  });
  
  const yearColors = {
    2020: colors.info,
    2021: colors.primaryDark,
    2022: colors.warning,
    2023: colors.danger,
    2024: '#7c3aed',
    2025: '#06b6d4'
  };

  const COLORS = [colors.info, colors.primaryDark, colors.warning, colors.danger, '#7c3aed', '#06b6d4', colors.primary, '#f97316', '#ef4444', '#8b5cf6'];

  const feedbackByStatus = [
    { name: 'Submitted', value: feedback.filter(f => f.status === 'submitted').length, color: colors.info },
    { name: 'Under Review', value: feedback.filter(f => f.status === 'under_review').length, color: colors.warning },
    { name: 'Approved', value: feedback.filter(f => f.status === 'approved').length, color: colors.primaryDark },
    { name: 'Flagged', value: feedback.filter(f => f.status === 'flagged').length, color: colors.danger },
    { name: 'Escalated', value: feedback.filter(f => f.status === 'escalated').length, color: '#991b1b' }
  ].filter(item => item.value > 0);

  // Group budgets and expenditures by year
  const budgetChartData = Object.values(
    budgets.reduce((acc, b) => {
      if (!acc[b.year]) {
        acc[b.year] = { year: b.year, budget: 0, spent: 0 };
      }
      acc[b.year].budget += b.amount;
      return acc;
    }, {})
  );

  // Add expenditures to the grouped data
  expenditures.forEach(exp => {
    const budget = budgets.find(b => b.id === exp.budget_id);
    if (budget) {
      const yearData = budgetChartData.find(d => d.year === budget.year);
      if (yearData) {
        yearData.spent += exp.amount;
      }
    }
  });

  // Sort by year
  budgetChartData.sort((a, b) => a.year - b.year);

  const totalBudget = getTotalBudget;
  const totalSpent = getTotalSpent;
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
      <div style={{ minHeight: '100vh', background: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '4px solid ' + colors.border, borderTop: '4px solid ' + colors.info, borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: colors.gray, marginTop: '16px', fontSize: '16px', fontWeight: '500' }}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.background }}>
      {/* Header - eCitizen style */}
      <div style={{ background: colors.primary, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: colors.white, fontSize: '20px', fontWeight: '600', margin: '0' }}>
              OpenGov Kenya
            </h1>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
            Budget Dashboard
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(16px, 4vw, 30px) clamp(16px, 4vw, 40px)' }}>
        {/* Sector Selector */}
        <div style={{ background: colors.white, borderRadius: '8px', padding: '20px', marginBottom: '20px', border: '1px solid ' + colors.border }}>
          <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Select Ministry Sector
          </label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              padding: '10px 12px', 
              background: colors.white, 
              border: '1px solid ' + colors.border, 
              borderRadius: '4px', 
              color: colors.dark, 
              fontSize: '14px', 
              cursor: 'pointer'
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
              <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
                Filter by Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  background: colors.white, 
                  border: '2px solid ' + colors.border, 
                  borderRadius: '8px', 
                  color: colors.dark, 
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
              <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
                Filter by County
              </label>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  background: colors.white, 
                  border: '2px solid ' + colors.border, 
                  borderRadius: '8px', 
                  color: colors.dark, 
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '24px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Budget</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
            <div style={{ color: colors.dark, fontSize: '22px', fontWeight: '700', marginBottom: '6px', wordBreak: 'break-word', lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis' }}>KSh {totalBudget.toLocaleString()}</div>
            <div style={{ color: colors.lightGray, fontSize: '13px' }}>Allocated for FY 2024/2025</div>
          </div>

          <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '24px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expenditure</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
            </div>
            <div style={{ color: colors.dark, fontSize: '22px', fontWeight: '700', marginBottom: '6px', wordBreak: 'break-word', lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis' }}>KSh {totalSpent.toLocaleString()}</div>
            <div style={{ color: colors.lightGray, fontSize: '13px' }}>Amount spent to date</div>
          </div>

          <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '24px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
            </div>
            <div style={{ color: colors.dark, fontSize: '22px', fontWeight: '700', marginBottom: '6px', wordBreak: 'break-word', lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis' }}>KSh {remaining.toLocaleString()}</div>
            <div style={{ color: colors.lightGray, fontSize: '13px' }}>Remaining balance</div>
          </div>

          <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '24px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Utilization</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.info} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
            </div>
            <div style={{ color: colors.dark, fontSize: '22px', fontWeight: '700', marginBottom: '6px', wordBreak: 'break-word', lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis' }}>{utilizationRate}%</div>
            <div style={{ color: colors.lightGray, fontSize: '13px' }}>Budget execution rate</div>
          </div>
        </div>

        {/* Budget Allocation Trend */}
        {trendData.length > 0 && (
          <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '28px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
            <div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showTrendChart ? '24px' : '0', cursor: 'pointer' }}
              onClick={() => setShowTrendChart(!showTrendChart)}
            >
              <div>
                <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>Budget Allocation Trend Over Time</h3>
                <p style={{ color: colors.gray, fontSize: '13px', margin: '0' }}>Historical budget allocation analysis</p>
              </div>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid ' + colors.border,
                  background: colors.background,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.gray} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showTrendChart ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            {showTrendChart && (
              <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis 
                    dataKey="year" 
                    stroke={colors.gray} 
                    style={{ fontSize: '13px', fontWeight: 600 }} 
                  />
                    <YAxis 
                    stroke={colors.gray} 
                    style={{ fontSize: '12px', fontWeight: 600 }}
                    width={60}
                    tickFormatter={(value) => {
                      if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                      if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                      return value;
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: colors.white, 
                      border: '1px solid ' + colors.border, 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                    }}
                    formatter={(value) => [`KSh ${value.toLocaleString()}`, 'Allocation']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke={colors.primaryDark} 
                    strokeWidth={3}
                    name="Budget Allocation"
                    dot={{ fill: colors.primaryDark, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* AI Summary Section - Citizen Version */}
        {totalBudget > 0 && (
          <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '28px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showInsights ? '24px' : '0', cursor: 'pointer' }}
              onClick={() => setShowInsights(!showInsights)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, ' + colors.primary + ' 0%, ' + colors.primaryDark + ' 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <div>
                  <h3 style={{ color: colors.dark, fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>
                    Understanding Your Government Budget
                  </h3>
                  <p style={{ color: colors.gray, fontSize: '14px', margin: '0' }}>AI-powered insights for citizens</p>
                </div>
              </div>
              <button
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid ' + colors.border,
                  background: colors.background,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.gray} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showInsights ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            
            {showInsights && (
              <>
                {/* Main Explanation */}
                <div style={{ background: colors.background, borderRadius: '12px', padding: '24px', marginBottom: '20px', border: '1px solid ' + colors.border }}>
                  <div style={{ color: colors.primary, fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    What This Means For You
                  </div>
                  <p style={{ color: colors.dark, fontSize: '15px', lineHeight: '1.8', margin: '0 0 16px 0' }}>
                    The government has allocated <strong style={{ color: colors.primary }}>KSh {totalBudget.toLocaleString()}</strong> for the {sector === 'education' ? 'Ministry of Education' : 'Ministry of Health'} this fiscal year. 
                    {utilizationRate < 50 
                      ? ` So far, only KSh ${totalSpent.toLocaleString()} (${utilizationRate}%) has been spent. This means KSh ${remaining.toLocaleString()} is still available for ${sector} services in your community.`
                      : utilizationRate < 80
                      ? ` Currently, KSh ${totalSpent.toLocaleString()} (${utilizationRate}%) has been used for ${sector} programs. There is still KSh ${remaining.toLocaleString()} remaining to serve citizens.`
                      : ` Most of the budget has been utilized - KSh ${totalSpent.toLocaleString()} (${utilizationRate}%) has been spent, leaving KSh ${remaining.toLocaleString()} for the rest of the year.`
                    }
                  </p>
                  <div style={{ padding: '14px 16px', background: colors.white, borderLeft: '3px solid ' + colors.primary, borderRadius: '8px', display: 'flex', gap: '12px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <p style={{ color: colors.darkGray, fontSize: '14px', margin: '0', fontWeight: '500' }}>
                      <strong>Transparency Note:</strong> This budget comes from your taxes and is meant to improve {sector === 'education' ? 'schools, teachers, and learning materials' : 'hospitals, healthcare workers, and medical services'} across Kenya.
                    </p>
                  </div>
                </div>

                {/* Citizen Insights */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ background: colors.background, borderRadius: '12px', padding: '20px', border: '1px solid ' + colors.border }}>
                    <div style={{ color: colors.primaryDark, fontSize: '14px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(5, 150, 105, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.primaryDark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      Budget Status
                    </div>
                    <p style={{ color: colors.gray, fontSize: '14px', lineHeight: '1.7', margin: '0' }}>
                      {utilizationRate < 30 
                        ? 'Spending is low. The government should speed up project implementation to serve citizens better.'
                        : utilizationRate < 70
                        ? 'Budget execution is on track. Funds are being used as planned throughout the year.'
                        : utilizationRate < 90
                        ? 'Most funds have been used. The government is actively delivering services with the allocated budget.'
                        : 'Budget is nearly exhausted. Planning for next fiscal year should begin soon.'}
                    </p>
                  </div>
                  
                  <div style={{ background: colors.background, borderRadius: '12px', padding: '20px', border: '1px solid ' + colors.border }}>
                    <div style={{ color: colors.info, fontSize: '14px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.info} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      Your Voice Matters
                    </div>
                    <p style={{ color: colors.gray, fontSize: '14px', lineHeight: '1.7', margin: '0' }}>
                      {feedback.length === 0
                        ? 'No citizen feedback yet. Be the first to share your thoughts on how this budget is being used in your area!'
                        : `${feedback.length} citizens have already shared feedback. Join the conversation and help improve government accountability!`}
                    </p>
                  </div>
                  
                  <div style={{ background: colors.background, borderRadius: '12px', padding: '20px', border: '1px solid ' + colors.border }}>
                    <div style={{ color: colors.primary, fontSize: '14px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                      </div>
                      Take Action
                    </div>
                    <p style={{ color: colors.gray, fontSize: '14px', lineHeight: '1.7', margin: '0 0 14px 0' }}>
                      You can help ensure this money serves your community well. Share your observations and concerns.
                    </p>
                    <button
                      onClick={() => window.location.href = '/feedback'}
                      style={{ padding: '10px 20px', background: colors.primary, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
                      onMouseOver={(e) => e.target.style.background = colors.primaryDark}
                      onMouseOut={(e) => e.target.style.background = colors.primary}
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Charts Section */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: 'clamp(16px, 3vw, 28px)', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>
                    Budget vs Expenditure
                  </h3>
                  <p style={{ color: colors.gray, fontSize: '13px', margin: '0' }}>Yearly comparison of allocated and spent funds</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', background: colors.background, padding: '4px', borderRadius: '8px', border: '1px solid ' + colors.border }}>
                  <button
                    onClick={() => setChartType('bar')}
                    style={{
                      padding: '6px 12px',
                      background: chartType === 'bar' ? colors.white : 'transparent',
                      color: chartType === 'bar' ? colors.dark : colors.gray,
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: chartType === 'bar' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    style={{
                      padding: '6px 12px',
                      background: chartType === 'line' ? colors.white : 'transparent',
                      color: chartType === 'line' ? colors.dark : colors.gray,
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: chartType === 'line' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Line
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colors.primary }}></div>
                  <span style={{ fontSize: '12px', color: colors.gray, fontWeight: '500' }}>Budget</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colors.danger }}></div>
                  <span style={{ fontSize: '12px', color: colors.gray, fontWeight: '500' }}>Spent</span>
                </div>
              </div>
            </div>
            {budgetChartData.length > 0 ? (
              <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={budgetChartData} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                    <XAxis dataKey="year" stroke={colors.gray} style={{ fontSize: '12px', fontWeight: 600 }} />
                    <YAxis 
                      stroke={colors.gray} 
                      style={{ fontSize: '12px', fontWeight: 600 }} 
                      width={60}
                      tickFormatter={(value) => {
                        if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                        if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                        return value;
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', fontSize: '13px' }}
                      formatter={(value) => [`KSh ${value.toLocaleString()}`, '']} 
                      labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                    />
                    <Bar dataKey="budget" fill={colors.primary} name="Budget" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="spent" fill={colors.danger} name="Spent" radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={budgetChartData} margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                    <XAxis dataKey="year" stroke={colors.gray} style={{ fontSize: '12px', fontWeight: 600 }} />
                    <YAxis 
                      stroke={colors.gray} 
                      style={{ fontSize: '12px', fontWeight: 600 }} 
                      width={60}
                      tickFormatter={(value) => {
                        if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                        if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                        return value;
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', fontSize: '13px' }}
                      formatter={(value) => [`KSh ${value.toLocaleString()}`, '']} 
                      labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="budget" 
                      stroke={colors.primary} 
                      strokeWidth={3}
                      name="Budget"
                      dot={{ fill: colors.primary, r: 5, strokeWidth: 2, stroke: colors.white }}
                      activeDot={{ r: 7 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="spent" 
                      stroke={colors.danger} 
                      strokeWidth={3}
                      name="Spent"
                      dot={{ fill: colors.danger, r: 5, strokeWidth: 2, stroke: colors.white }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: colors.lightGray }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No budget data available</p>
              </div>
            )}
          </div>

          <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: 'clamp(16px, 3vw, 28px)', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>
                Budget Distribution by County
              </h3>
              <p style={{ color: colors.gray, fontSize: '13px', margin: '0' }}>Regional allocation breakdown by year</p>
            </div>
            {budgetByCounty.length > 0 ? (
              <>
                <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid ' + colors.border }}>
                  {Array.from(allYears).sort().map((year, index) => (
                    <div key={year} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: yearColors[year] || COLORS[index % COLORS.length] }}></div>
                      <span style={{ fontSize: '12px', color: colors.gray, fontWeight: '500' }}>{year}</span>
                    </div>
                  ))}
                </div>
                <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetByCounty} margin={{ left: 0, right: 10, top: 10, bottom: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke={colors.gray} 
                      style={{ fontSize: '10px', fontWeight: 600 }}
                      angle={-60}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ dy: 5 }}
                    />
                    <YAxis 
                      stroke={colors.gray} 
                      style={{ fontSize: '12px', fontWeight: 600 }}
                      width={60}
                      tickFormatter={(value) => {
                        if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                        if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                        return value;
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', fontSize: '13px', padding: '12px' }}
                      formatter={(value, name) => [`KSh ${value.toLocaleString()}`, name]}
                      labelStyle={{ fontWeight: 700, marginBottom: '8px', color: colors.dark }}
                    />
                    {Array.from(allYears).sort().map((year, index) => (
                      <Bar 
                        key={year} 
                        dataKey={year} 
                        stackId="a" 
                        fill={yearColors[year] || COLORS[index % COLORS.length]} 
                        radius={index === allYears.size - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: colors.lightGray }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No county data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Budget Details Table */}
        <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid ' + colors.border }}>
            <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0 0 20px 0' }}>
              Budget Breakdown
            </h3>
            {/* Filters inside Budget Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {/* Year Filter */}
              {years.length > 0 && (
                <div>
                  <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Filter by Year
                  </label>
                  <select
                    value={tableYear}
                    onChange={(e) => setTableYear(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px 14px', 
                      background: colors.white, 
                      border: '2px solid ' + colors.border, 
                      borderRadius: '8px', 
                      color: colors.dark, 
                      fontSize: '14px', 
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
                  <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Filter by County
                  </label>
                  <select
                    value={tableCounty}
                    onChange={(e) => setTableCounty(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px 14px', 
                      background: colors.white, 
                      border: '2px solid ' + colors.border, 
                      borderRadius: '8px', 
                      color: colors.dark, 
                      fontSize: '14px', 
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
          </div>
          {!tableYear && !tableCounty ? (
            <div style={{ padding: '60px 28px', textAlign: 'center', color: colors.lightGray }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <p style={{ fontSize: '16px', fontWeight: '600', color: colors.gray, marginBottom: '8px' }}>Please select filters to view budget breakdown</p>
              <p style={{ fontSize: '14px', color: colors.lightGray }}>Choose a year and/or county from the filters above</p>
            </div>
          ) : tableBudgets.length === 0 ? (
            <div style={{ padding: '60px 28px', textAlign: 'center', color: colors.lightGray }}>No budget data available for the selected filters</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: colors.background }}>
                    <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Year</th>
                    <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>County</th>
                    <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                    <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {tableBudgets.map((budget, idx) => (
                    <tr key={budget.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '18px 28px', color: colors.dark, fontSize: '15px', fontWeight: '600' }}>{budget.year}</td>
                      <td style={{ padding: '18px 28px', color: colors.info, fontSize: '15px', fontWeight: '600' }}>{budget.county || 'N/A'}</td>
                      <td style={{ padding: '18px 28px', color: colors.primaryDark, fontSize: '15px', fontWeight: '700' }}>KSh {budget.amount.toLocaleString()}</td>
                      <td style={{ padding: '18px 28px', color: colors.gray, fontSize: '14px' }}>{budget.description}</td>
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

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

function Expenditures() {
  const [expenditures, setExpenditures] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState('');
  const [year, setYear] = useState('');
  const [county, setCounty] = useState('');
  const [sectors, setSectors] = useState([]);
  const [years, setYears] = useState([]);
  const [counties, setCounties] = useState([]);
  const [showBudgetTable, setShowBudgetTable] = useState(false);
  const [showExpTable, setShowExpTable] = useState(false);
  const [budgetRowsToShow, setBudgetRowsToShow] = useState(10);
  const [expRowsToShow, setExpRowsToShow] = useState(10);
  const [showTimelineChart, setShowTimelineChart] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectorsRes, budRes, expRes] = await Promise.all([
          apiClient.get('/sectors'),
          apiClient.get('/budgets'),
          apiClient.get('/expenditures')
        ]);
        setExpenditures(expRes.data);
        setBudgets(budRes.data);
        setSectors(sectorsRes.data);
        
        const uniqueYears = [...new Set(budRes.data.map(b => b.year))].sort((a, b) => b - a);
        setYears(uniqueYears);
        const uniqueCounties = [...new Set(budRes.data.map(b => b.county).filter(c => c))].sort();
        setCounties(uniqueCounties);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getBudgetInfo = (budgetId) => {
    return budgets.find(b => b.id === budgetId);
  };

  const getTotalSpent = (budgetId) => {
    return expenditures
      .filter(e => e.budget_id === budgetId)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '4px solid ' + colors.border, borderTop: '4px solid ' + colors.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: colors.gray, marginTop: '16px', fontSize: '16px', fontWeight: '500' }}>Loading Expenditures...</p>
        </div>
      </div>
    );
  }

  // Filter budgets and expenditures
  const filteredBudgets = budgets.filter(b => {
    if (sector && b.sector !== sector) return false;
    if (year && b.year !== parseInt(year)) return false;
    if (county && b.county !== county) return false;
    return true;
  });
  
  const filteredBudgetIds = filteredBudgets.map(b => b.id);
  const filteredExpenditures = expenditures.filter(e => filteredBudgetIds.includes(e.budget_id));

  // Budget utilization by sector
  const sectorData = {};
  filteredBudgets.forEach(budget => {
    const sectorName = budget.sector;
    if (!sectorData[sectorName]) {
      sectorData[sectorName] = { name: sectorName, budget: 0, spent: 0 };
    }
    sectorData[sectorName].budget += budget.amount;
    sectorData[sectorName].spent += getTotalSpent(budget.id);
  });
  const sectorUtilization = Object.values(sectorData).sort((a, b) => b.budget - a.budget);

  // Budget vs Spending over time with utilization
  const yearlyComparison = {};
  
  filteredBudgets.forEach(budget => {
    const year = budget.year;
    if (!yearlyComparison[year]) {
      yearlyComparison[year] = { year: year, budget: 0, spent: 0 };
    }
    yearlyComparison[year].budget += budget.amount;
    yearlyComparison[year].spent += getTotalSpent(budget.id);
  });
  
  const yearlyData = Object.values(yearlyComparison)
    .map(item => ({
      ...item,
      utilization: item.budget > 0 ? ((item.spent / item.budget) * 100).toFixed(1) : 0,
      remaining: item.budget - item.spent
    }))
    .sort((a, b) => a.year - b.year);

  return (
    <div style={{ minHeight: '100vh', background: colors.background }}>
      {/* Header */}
      <div style={{ background: colors.primary, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: colors.white, fontSize: '20px', fontWeight: '600', margin: '0' }}>
              OpenGov Kenya
            </h1>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
            Expenditure Tracking
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 40px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: colors.dark, marginBottom: '8px' }}>
            Budget Expenditure Tracking
          </h2>
          <p style={{ fontSize: '15px', color: colors.gray }}>
            Monitor budget allocations and actual spending across sectors
          </p>
        </div>

      {/* Filters */}
      <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '24px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ color: colors.dark, fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Filter Data</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: colors.white, border: '1px solid ' + colors.border, borderRadius: '8px', color: colors.dark, fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="">All Sectors</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: colors.white, border: '1px solid ' + colors.border, borderRadius: '8px', color: colors.dark, fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: colors.dark, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>County</label>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: colors.white, border: '1px solid ' + colors.border, borderRadius: '8px', color: colors.dark, fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="">All Counties</option>
              {counties.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Visualizations */}
      <div style={{ marginBottom: '30px' }}>
        {/* Budget Utilization by Sector */}
        <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '28px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>
              Budget vs Spending by Sector
            </h3>
            <p style={{ color: colors.gray, fontSize: '13px', margin: '0' }}>Comparison of allocated budget and actual expenditure</p>
          </div>
          {sectorUtilization.length > 0 ? (
            <>
              <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid ' + colors.border }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colors.primary }}></div>
                  <span style={{ fontSize: '12px', color: colors.gray, fontWeight: '500' }}>Budget Allocated</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colors.danger }}></div>
                  <span style={{ fontSize: '12px', color: colors.gray, fontWeight: '500' }}>Amount Spent</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={450}>
                <LineChart data={sectorUtilization} margin={{ left: 20, right: 20, top: 10, bottom: 60 }}>
                  <defs>
                    <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.danger} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors.danger} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke={colors.gray} 
                    style={{ fontSize: '11px', fontWeight: 600 }}
                    angle={-60}
                    textAnchor="end"
                    height={120}
                    interval={0}
                    tick={{ dy: 5 }}
                  />
                  <YAxis 
                    stroke={colors.gray} 
                    style={{ fontSize: '12px', fontWeight: 600 }}
                    width={70}
                    tickFormatter={(value) => {
                      if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                      if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                      return value;
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', fontSize: '13px', padding: '12px' }}
                    formatter={(value) => [`KSh ${value.toLocaleString()}`, '']}
                    labelStyle={{ fontWeight: 700, marginBottom: '8px', color: colors.dark }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="budget" 
                    stroke="none"
                    fill="url(#budgetGradient)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spent" 
                    stroke="none"
                    fill="url(#spentGradient)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="budget" 
                    stroke={colors.primary} 
                    strokeWidth={3}
                    dot={{ fill: colors.white, stroke: colors.primary, strokeWidth: 3, r: 6 }}
                    activeDot={{ r: 8, fill: colors.primary, stroke: colors.white, strokeWidth: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="spent" 
                    stroke={colors.danger} 
                    strokeWidth={3}
                    dot={{ fill: colors.white, stroke: colors.danger, strokeWidth: 3, r: 6 }}
                    activeDot={{ r: 8, fill: colors.danger, stroke: colors.white, strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: colors.lightGray }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No data available</p>
            </div>
          )}
        </div>

        {/* Budget vs Expenditure Trend Over Time */}
        <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: '28px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showTimelineChart ? '24px' : '0', cursor: 'pointer' }}
            onClick={() => setShowTimelineChart(!showTimelineChart)}
          >
            <div>
              <h3 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>
                Budget vs Expenditure Trend Over Time
              </h3>
              <p style={{ color: colors.gray, fontSize: '13px', margin: '0' }}>Yearly budget allocation, spending, and utilization rates</p>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.gray} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showTimelineChart ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          {showTimelineChart && (
            <>
              {yearlyData.length > 0 ? (
                <>
                  <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid ' + colors.border }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colors.info }}></div>
                      <span style={{ fontSize: '12px', color: colors.gray, fontWeight: '500' }}>Budget Allocated</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colors.danger }}></div>
                      <span style={{ fontSize: '12px', color: colors.gray, fontWeight: '500' }}>Amount Spent</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colors.success }}></div>
                      <span style={{ fontSize: '12px', color: colors.gray, fontWeight: '500' }}>Remaining</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={yearlyData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                      <XAxis 
                        dataKey="year" 
                        stroke={colors.gray} 
                        style={{ fontSize: '12px', fontWeight: 600 }}
                      />
                      <YAxis 
                        stroke={colors.gray} 
                        style={{ fontSize: '12px', fontWeight: 600 }}
                        width={70}
                        tickFormatter={(value) => {
                          if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                          if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                          if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                          return value;
                        }}
                      />
                      <Tooltip 
                        contentStyle={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', fontSize: '13px', padding: '12px' }}
                        formatter={(value, name) => {
                          if (name === 'Utilization') return [`${value}%`, name];
                          return [`KSh ${value.toLocaleString()}`, name];
                        }}
                        labelFormatter={(label) => `Year: ${label}`}
                        labelStyle={{ fontWeight: 700, marginBottom: '8px', color: colors.dark }}
                      />
                      <Bar dataKey="budget" fill={colors.info} name="Budget Allocated" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="spent" fill={colors.danger} name="Amount Spent" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="remaining" fill={colors.success} name="Remaining" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  {/* Utilization Summary Cards */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid ' + colors.border, overflowX: 'auto' }}>
                    {yearlyData.map(item => {
                      const statusColor = item.utilization > 90 ? colors.danger : item.utilization > 70 ? colors.warning : colors.success;
                      const statusBg = item.utilization > 90 ? 'rgba(220, 38, 38, 0.1)' : item.utilization > 70 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(22, 163, 74, 0.1)';
                      
                      return (
                        <div key={item.year} style={{ background: colors.white, borderRadius: '10px', padding: '16px', border: '1px solid ' + colors.border, boxShadow: '0 2px 4px rgba(0,0,0,0.06)', minWidth: '180px', flex: '1' }}>
                          {/* Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <div style={{ color: colors.dark, fontSize: '16px', fontWeight: '700' }}>{item.year}</div>
                            <div style={{ padding: '3px 8px', borderRadius: '4px', background: statusBg, color: statusColor, fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                              {item.utilization > 90 ? 'HIGH' : item.utilization > 70 ? 'GOOD' : 'LOW'}
                            </div>
                          </div>
                          
                          {/* Utilization */}
                          <div style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: statusColor, lineHeight: '1', marginBottom: '6px' }}>{item.utilization}%</div>
                            <div style={{ width: '100%', background: colors.border, borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  height: '6px', 
                                  borderRadius: '6px',
                                  width: `${Math.min(item.utilization, 100)}%`,
                                  backgroundColor: statusColor,
                                  transition: 'width 0.5s ease'
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Details */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '10px', borderTop: '1px solid ' + colors.border }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', color: colors.gray, fontWeight: '500' }}>Budget</span>
                              <span style={{ fontSize: '11px', color: colors.dark, fontWeight: '700' }}>{(item.budget / 1000000).toFixed(1)}M</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', color: colors.gray, fontWeight: '500' }}>Spent</span>
                              <span style={{ fontSize: '11px', color: colors.danger, fontWeight: '700' }}>{(item.spent / 1000000).toFixed(1)}M</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', color: colors.gray, fontWeight: '500' }}>Left</span>
                              <span style={{ fontSize: '11px', color: colors.success, fontWeight: '700' }}>{(item.remaining / 1000000).toFixed(1)}M</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: colors.lightGray }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 500 }}>No data available</p>
                  <p style={{ margin: 0, fontSize: '13px', color: colors.gray }}>Try adjusting your filter selections above</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
        <div 
          style={{ padding: '20px 28px', borderBottom: showBudgetTable ? '1px solid ' + colors.border : 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          onClick={() => setShowBudgetTable(!showBudgetTable)}
        >
          <div>
            <h2 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>Budget vs Actual Spending</h2>
            <p style={{ color: colors.gray, fontSize: '13px', margin: '0' }}>Detailed breakdown of budget utilization</p>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.gray} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showBudgetTable ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
        {showBudgetTable && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: colors.background }}>
                  <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sector</th>
                  <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Year</th>
                  <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Budget Amount</th>
                  <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Spent</th>
                  <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remaining</th>
                  <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {filteredBudgets.slice(0, budgetRowsToShow).map((budget) => {
                  const spent = getTotalSpent(budget.id);
                  const remaining = budget.amount - spent;
                  const utilization = ((spent / budget.amount) * 100).toFixed(1);
                  return (
                    <tr key={budget.id} style={{ borderBottom: '1px solid ' + colors.border }}>
                      <td style={{ padding: '18px 28px', color: colors.dark, fontSize: '14px', fontWeight: '600' }}>{budget.sector}</td>
                      <td style={{ padding: '18px 28px', color: colors.gray, fontSize: '14px' }}>{budget.year}</td>
                      <td style={{ padding: '18px 28px', color: colors.dark, fontSize: '14px', fontWeight: '600' }}>KSh {budget.amount.toLocaleString()}</td>
                      <td style={{ padding: '18px 28px', color: colors.dark, fontSize: '14px', fontWeight: '600' }}>KSh {spent.toLocaleString()}</td>
                      <td style={{ padding: '18px 28px', fontSize: '14px', fontWeight: '600', color: remaining < 0 ? colors.danger : colors.success }}>
                        KSh {remaining.toLocaleString()}
                      </td>
                      <td style={{ padding: '18px 28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: '64px', background: colors.border, borderRadius: '4px', height: '8px', marginRight: '8px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                height: '8px', 
                                borderRadius: '4px',
                                width: `${Math.min(utilization, 100)}%`,
                                backgroundColor: utilization > 90 ? colors.danger : utilization > 70 ? colors.warning : colors.success
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '13px', color: colors.gray, fontWeight: '600' }}>{utilization}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredBudgets.length > budgetRowsToShow && (
              <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid ' + colors.border, background: colors.background }}>
                <button
                  onClick={() => setBudgetRowsToShow(budgetRowsToShow + 10)}
                  style={{ padding: '10px 24px', background: colors.primary, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
                  onMouseOver={(e) => e.target.style.background = colors.primaryDark}
                  onMouseOut={(e) => e.target.style.background = colors.primary}
                >
                  Show More ({filteredBudgets.length - budgetRowsToShow} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
        <div 
          style={{ padding: '20px 28px', borderBottom: showExpTable ? '1px solid ' + colors.border : 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          onClick={() => setShowExpTable(!showExpTable)}
        >
          <div>
            <h2 style={{ color: colors.dark, fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>Expenditure Details</h2>
            <p style={{ color: colors.gray, fontSize: '13px', margin: '0' }}>Complete list of all expenditure transactions</p>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.gray} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showExpTable ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
        {showExpTable && (
          <>
            {filteredExpenditures.length === 0 ? (
              <div style={{ padding: '80px 28px', textAlign: 'center', color: colors.lightGray }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No expenditure records found</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: colors.background }}>
                        <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                        <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Budget</th>
                        <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                        <th style={{ padding: '16px 28px', textAlign: 'left', color: colors.gray, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenditures.slice(0, expRowsToShow).map((exp) => {
                        const budget = getBudgetInfo(exp.budget_id);
                        return (
                          <tr key={exp.id} style={{ borderBottom: '1px solid ' + colors.border }}>
                            <td style={{ padding: '18px 28px', color: colors.gray, fontSize: '14px' }}>
                              {new Date(exp.date).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '18px 28px', color: colors.dark, fontSize: '14px', fontWeight: '600' }}>
                              {exp.sector ? `${exp.sector} ${exp.year}` : 'N/A'}
                            </td>
                            <td style={{ padding: '18px 28px', color: colors.primaryDark, fontSize: '14px', fontWeight: '700' }}>
                              KSh {exp.amount.toLocaleString()}
                            </td>
                            <td style={{ padding: '18px 28px', color: colors.gray, fontSize: '14px' }}>{exp.description}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredExpenditures.length > expRowsToShow && (
                  <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid ' + colors.border, background: colors.background }}>
                    <button
                      onClick={() => setExpRowsToShow(expRowsToShow + 10)}
                      style={{ padding: '10px 24px', background: colors.primary, color: colors.white, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
                      onMouseOver={(e) => e.target.style.background = colors.primaryDark}
                      onMouseOut={(e) => e.target.style.background = colors.primary}
                    >
                      Show More ({filteredExpenditures.length - expRowsToShow} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </>
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

export default Expenditures;

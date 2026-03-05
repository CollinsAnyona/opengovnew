import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api/apiClient';

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
        const [expRes, budRes, sectorsRes] = await Promise.all([
          apiClient.get('/expenditures'),
          apiClient.get('/budgets'),
          apiClient.get('/sectors')
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

  // Filter budgets and expenditures
  const filteredBudgets = budgets.filter(b => {
    if (sector && b.sector !== sector) return false;
    if (year && b.year !== parseInt(year)) return false;
    if (county && b.county !== county) return false;
    return true;
  });
  
  const filteredBudgetIds = filteredBudgets.map(b => b.id);
  const filteredExpenditures = expenditures.filter(e => filteredBudgetIds.includes(e.budget_id));

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading...</div>;
  }

  // Group budgets by sector and year for summary table
  const budgetSummary = budgets.reduce((acc, budget) => {
    const key = `${budget.sector}_${budget.year}`;
    if (!acc[key]) {
      acc[key] = { ...budget, totalAmount: 0 };
    }
    acc[key].totalAmount += budget.amount;
    return acc;
  }, {});
  const summaryBudgets = Object.values(budgetSummary);

  // Budget utilization by sector - group by sector only (combine counties)
  const sectorData = {};
  filteredBudgets.forEach(budget => {
    const sector = budget.sector;
    if (!sectorData[sector]) {
      sectorData[sector] = { name: sector, budget: 0, spent: 0 };
    }
    sectorData[sector].budget += budget.amount;
    sectorData[sector].spent += getTotalSpent(budget.id);
  });
  const sectorUtilization = Object.values(sectorData).sort((a, b) => b.budget - a.budget);

  // Spending over time (group by year instead of month)
  const spendingTimeline = filteredExpenditures.reduce((acc, exp) => {
    const date = new Date(exp.date);
    const year = date.getFullYear();
    if (!acc[year]) {
      acc[year] = { year: year, amount: 0 };
    }
    acc[year].amount += exp.amount;
    return acc;
  }, {});
  const timelineData = Object.values(spendingTimeline).sort((a, b) => a.year - b.year);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Budget Expenditure Tracking
        </h1>
        <p className="text-gray-600">
          Monitor budget allocations and actual spending across sectors
        </p>
      </div>

      {/* Filters */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Filter Data</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#666', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#ffffff', border: '2px solid #d1d5db', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="">All Sectors</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: '#666', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#ffffff', border: '2px solid #d1d5db', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: '#666', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>County</label>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#ffffff', border: '2px solid #d1d5db', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
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
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
            Budget vs Spending by Sector
          </h3>
          {sectorUtilization.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={sectorUtilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#666" 
                  style={{ fontSize: '13px' }}
                  angle={-45}
                  textAnchor="end"
                  height={120}
                />
                <YAxis 
                  stroke="#666" 
                  style={{ fontSize: '13px' }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  formatter={(value) => `KSh ${value.toLocaleString()}`}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="#0066cc" 
                  strokeWidth={3}
                  name="Budget Allocated"
                  dot={{ fill: '#0066cc', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="spent" 
                  stroke="#dc2626" 
                  strokeWidth={3}
                  name="Amount Spent"
                  dot={{ fill: '#dc2626', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>No data available</div>
          )}
        </div>

        {/* Spending Over Time */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', cursor: 'pointer' }}
            onClick={() => setShowTimelineChart(!showTimelineChart)}
          >
            <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '700', margin: 0 }}>
              Spending Trend Over the Years
            </h3>
            <span style={{ fontSize: '20px', color: '#666' }}>{showTimelineChart ? '−' : '+'}</span>
          </div>
          {showTimelineChart && (
            <>
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="year" 
                      stroke="#666" 
                      style={{ fontSize: '13px' }}
                    />
                    <YAxis 
                      stroke="#666" 
                      style={{ fontSize: '13px' }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    />
                    <Tooltip 
                      contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      formatter={(value) => `KSh ${value.toLocaleString()}`}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#059669" 
                      strokeWidth={3}
                      name="Expenditure"
                      dot={{ fill: '#059669', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                  <p style={{ marginBottom: '8px' }}>No expenditure data available for the selected filters</p>
                  <p style={{ fontSize: '14px' }}>Try adjusting your filter selections above</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div 
          className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
          onClick={() => setShowBudgetTable(!showBudgetTable)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h2 className="text-xl font-semibold text-gray-900">Budget vs Actual Spending</h2>
          <span style={{ fontSize: '20px', color: '#666' }}>{showBudgetTable ? '−' : '+'}</span>
        </div>
        {showBudgetTable && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBudgets.slice(0, budgetRowsToShow).map((budget) => {
                  const spent = getTotalSpent(budget.id);
                  const remaining = budget.amount - spent;
                  const utilization = ((spent / budget.amount) * 100).toFixed(1);
                  return (
                    <tr key={budget.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{budget.sector}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{budget.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KSh {budget.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KSh {spent.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: remaining < 0 ? '#dc3545' : '#28a745' }}>
                        KSh {remaining.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(utilization, 100)}%`,
                                backgroundColor: utilization > 90 ? '#dc3545' : utilization > 70 ? '#FFD700' : '#28a745'
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{utilization}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredBudgets.length > budgetRowsToShow && (
              <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
                <button
                  onClick={() => setBudgetRowsToShow(budgetRowsToShow + 10)}
                  style={{ padding: '10px 24px', background: '#0066cc', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Show More ({filteredBudgets.length - budgetRowsToShow} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div 
          className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
          onClick={() => setShowExpTable(!showExpTable)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h2 className="text-xl font-semibold text-gray-900">Expenditure Details</h2>
          <span style={{ fontSize: '20px', color: '#666' }}>{showExpTable ? '−' : '+'}</span>
        </div>
        {showExpTable && (
          <>
            {filteredExpenditures.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No expenditure records found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredExpenditures.slice(0, expRowsToShow).map((exp) => {
                        const budget = getBudgetInfo(exp.budget_id);
                        return (
                          <tr key={exp.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(exp.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {exp.sector ? `${exp.sector} ${exp.year}` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              KSh {exp.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{exp.description}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredExpenditures.length > expRowsToShow && (
                  <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
                    <button
                      onClick={() => setExpRowsToShow(expRowsToShow + 10)}
                      style={{ padding: '10px 24px', background: '#0066cc', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
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
  );
}

export default Expenditures;

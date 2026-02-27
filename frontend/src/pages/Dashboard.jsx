import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api/apiClient';

function Dashboard() {
  const [sector, setSector] = useState('education');
  const [budgets, setBudgets] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
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
    { name: 'Submitted', value: feedback.filter(f => f.status === 'submitted').length, color: '#64748b' },
    { name: 'Under Review', value: feedback.filter(f => f.status === 'under_review').length, color: '#f59e0b' },
    { name: 'Approved', value: feedback.filter(f => f.status === 'approved').length, color: '#10b981' },
    { name: 'Flagged', value: feedback.filter(f => f.status === 'flagged').length, color: '#ef4444' },
    { name: 'Escalated', value: feedback.filter(f => f.status === 'escalated').length, color: '#dc2626' }
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

  const getAISummary = () => {
    if (totalBudget === 0) return "No budget data available for this sector yet.";
    
    const summary = `For ${sector}, the government has allocated KSh ${totalBudget.toLocaleString()} in total. ` +
      `So far, KSh ${totalSpent.toLocaleString()} has been spent, which is ${utilizationRate}% of the budget. ` +
      `This means KSh ${remaining.toLocaleString()} is still available. ` +
      (utilizationRate < 50 ? "The spending is low - more funds can be used for projects." :
       utilizationRate < 80 ? "The spending is on track." :
       "Most of the budget has been used.");
    
    return summary;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Governance Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Track public financial management and transparency</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Sector</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="education">Education</option>
            <option value="health">Health</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Budget</div>
            <div className="text-2xl font-bold text-gray-900">KSh {totalBudget.toLocaleString()}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
            <div className="text-sm font-medium text-gray-600 mb-1">Expenditure</div>
            <div className="text-2xl font-bold text-gray-900">KSh {totalSpent.toLocaleString()}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <div className="text-sm font-medium text-gray-600 mb-1">Available</div>
            <div className="text-2xl font-bold text-gray-900">KSh {remaining.toLocaleString()}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
            <div className="text-sm font-medium text-gray-600 mb-1">Utilization</div>
            <div className="text-2xl font-bold text-gray-900">{utilizationRate}%</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">AI-Powered Insights</h2>
          {aiInsights ? (
            <>
              <p className="text-gray-700 mb-4">{aiInsights.summary}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Spending Status</h3>
                  <p className="text-gray-700 text-sm">{aiInsights.spending_status}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Citizen Engagement</h3>
                  <p className="text-gray-700 text-sm">{aiInsights.citizen_engagement}</p>
                </div>
              </div>
              {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                <div className="mt-4 bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {aiInsights.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-gray-700 text-sm">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-700">{getAISummary()}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Expenditure</h3>
            {budgetChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                  <Bar dataKey="spent" fill="#10b981" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">No budget data available</div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Distribution</h3>
            {feedbackByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={feedbackByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {feedbackByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">No feedback data available</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Budget Details</h3>
          </div>
          {budgets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No budget data available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budgets.map((budget) => (
                    <tr key={budget.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{budget.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KSh {budget.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{budget.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

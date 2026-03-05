import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

function Expenditures() {
  const [expenditures, setExpenditures] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, budRes] = await Promise.all([
          apiClient.get('/expenditures'),
          apiClient.get('/budgets')
        ]);
        setExpenditures(expRes.data);
        setBudgets(budRes.data);
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

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Budget vs Actual Spending</h2>
        </div>
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
              {budgets.map((budget) => {
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
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Expenditure Details</h2>
        </div>
        {expenditures.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No expenditure records found</div>
        ) : (
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
                {expenditures.map((exp) => {
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
        )}
      </div>
    </div>
  );
}

export default Expenditures;

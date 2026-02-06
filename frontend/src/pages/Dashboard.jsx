import { useState, useEffect } from 'react';
import apiClient from '../api/client';

const Dashboard = () => {
  const [sector, setSector] = useState('education');
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/budgets?sector=${sector}`);
      setBudgets(response.data);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [sector]);

  return (
    <div>
      <h1>Budget Dashboard</h1>
      
      <div>
        <label>Sector: </label>
        <select value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="education">Education</option>
          <option value="health">Health</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : budgets.length === 0 ? (
        <div>No budgets found for {sector}</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((budget) => (
              <tr key={budget.id}>
                <td>{budget.year}</td>
                <td>${budget.amount.toLocaleString()}</td>
                <td>{budget.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;
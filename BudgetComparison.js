import React, { useState, useEffect } from 'react';
import { getAllItems } from '../../services/databaseService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, Cell, PieChart, Pie
} from 'recharts';

const BudgetComparison = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Chart data
  const [budgetComparisonData, setBudgetComparisonData] = useState([]);
  const [monthlyComparisonData, setMonthlyComparisonData] = useState([]);
  const [categoryComparisonData, setCategoryComparisonData] = useState([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (budgets.length > 0 && expenses.length > 0 && categories.length > 0) {
      prepareChartData();
    }
  }, [budgets, expenses, categories]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load budgets
      const budgetsData = await getAllItems('budgets');
      setBudgets(budgetsData);
      
      // Load categories
      const categoriesData = await getAllItems('categories');
      setCategories(categoriesData);
      
      // Load expenses
      const expensesData = await getAllItems('expenses');
      setExpenses(expensesData);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      setLoading(false);
      console.error('Error loading data:', err);
    }
  };

  const prepareChartData = () => {
    // Prepare budget vs actual comparison data
    const budgetComparison = budgets.map(budget => {
      const actual = calculateActualSpending(budget);
      const category = categories.find(cat => cat.id === budget.category);
      
      return {
        name: budget.name,
        category: category ? category.name : 'All Categories',
        budget: budget.amount,
        actual: actual,
        variance: budget.amount - actual,
        percentUsed: Math.min(100, (actual / budget.amount) * 100)
      };
    });
    
    // Sort by variance (ascending, so overspent budgets come first)
    budgetComparison.sort((a, b) => a.variance - b.variance);
    
    setBudgetComparisonData(budgetComparison);
    
    // Prepare monthly budget vs actual data
    const monthlyData = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      monthlyData[monthKey] = {
        month: monthKey,
        monthName: monthName,
        budget: 0,
        actual: 0
      };
    }
    
    // Calculate monthly budgets
    budgets.forEach(budget => {
      if (budget.period === 'monthly') {
        Object.keys(monthlyData).forEach(monthKey => {
          monthlyData[monthKey].budget += budget.amount;
        });
      }
    });
    
    // Calculate monthly expenses
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].actual += expense.amount;
      }
    });
    
    // Convert to array and sort by month
    const monthlyArray = Object.values(monthlyData);
    monthlyArray.sort((a, b) => a.month.localeCompare(b.month));
    
    setMonthlyComparisonData(monthlyArray);
    
    // Prepare category budget vs actual data
    const categoryData = {};
    
    // Initialize with categories that have budgets
    budgets.forEach(budget => {
      if (budget.category) {
        const category = categories.find(cat => cat.id === budget.category);
        if (category) {
          categoryData[budget.category] = {
            name: category.name,
            budget: budget.amount,
            actual: 0
          };
        }
      }
    });
    
    // Calculate actual spending by category
    expenses.forEach(expense => {
      if (categoryData[expense.category]) {
        categoryData[expense.category].actual += expense.amount;
      }
    });
    
    // Convert to array
    const categoryArray = Object.values(categoryData);
    
    // Sort by budget (descending)
    categoryArray.sort((a, b) => b.budget - a.budget);
    
    setCategoryComparisonData(categoryArray);
  };

  const calculateActualSpending = (budget) => {
    // Filter expenses based on budget criteria
    let relevantExpenses = [...expenses];
    
    // Filter by date range if budget has start/end dates
    if (budget.startDate) {
      const startDate = new Date(budget.startDate);
      const endDate = budget.endDate ? new Date(budget.endDate) : new Date();
      
      relevantExpenses = relevantExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    } else {
      // If no date range, filter based on budget period
      const now = new Date();
      let periodStartDate;
      
      switch (budget.period) {
        case 'daily':
          periodStartDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'weekly':
          const day = now.getDay();
          periodStartDate = new Date(now.setDate(now.getDate() - day));
          periodStartDate.setHours(0, 0, 0, 0);
          break;
        case 'monthly':
          periodStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          periodStartDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          periodStartDate = new Date(0); // Beginning of time
      }
      
      relevantExpenses = relevantExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= periodStartDate;
      });
    }
    
    // Filter by category if budget has a specific category
    if (budget.category) {
      relevantExpenses = relevantExpenses.filter(expense => expense.category === budget.category);
    }
    
    // Calculate total spent
    return relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-semibold">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getVarianceClass = (variance) => {
    if (variance < 0) return 'text-red-600';
    if (variance < 100) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Budget vs. Actual Comparison</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">Loading comparison data...</div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-4">No budget data found. Create some budgets to see comparisons.</div>
      ) : (
        <div className="space-y-8">
          {/* Budget vs Actual Table */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Budget Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Budget</th>
                    <th className="py-3 px-6 text-left">Category</th>
                    <th className="py-3 px-6 text-right">Budget Amount</th>
                    <th className="py-3 px-6 text-right">Actual Spending</th>
                    <th className="py-3 px-6 text-right">Variance</th>
                    <th className="py-3 px-6 text-center">% Used</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {budgetComparisonData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {item.category}
                      </td>
                      <td className="py-3 px-6 text-right">
                        {formatCurrency(item.budget)}
                      </td>
                      <td className="py-3 px-6 text-right">
                        {formatCurrency(item.actual)}
                      </td>
                      <td className={`py-3 px-6 text-right ${getVarianceClass(item.variance)}`}>
                        {formatCurrency(item.variance)}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${item.percentUsed >= 100 ? 'bg-red-500' : 'bg-blue-500'}`} 
                              style={{ width: `${item.percentUsed}%` }}
                            ></div>
                          </div>
                          <span className="ml-2">{item.percentUsed.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Monthly Budget vs Actual Chart */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Monthly Budget vs. Actual</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyComparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#8884d8" />
                  <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
                  <Line type="monotone" dataKey="actual" name="Trend" stroke="#ff7300" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Category Budget vs Actual Chart */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Category Budget vs. Actual</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryComparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={formatCurrency} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#8884d8" />
                  <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetComparison;

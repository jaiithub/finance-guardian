import React, { useState, useEffect } from 'react';
import { getAllItems, getExpensesByDateRange, getExpensesByCategory } from '../../services/databaseService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const SpendingAnalysis = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('monthly');
  
  // Chart data
  const [categoryData, setCategoryData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [monthlyTotalData, setMonthlyTotalData] = useState([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

  useEffect(() => {
    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    setStartDate(firstDay);
    setEndDate(lastDay);
    
    loadData();
  }, []);

  useEffect(() => {
    if (expenses.length > 0 && categories.length > 0) {
      prepareChartData();
    }
  }, [expenses, categories, period]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesData = await getAllItems('categories');
      setCategories(categoriesData);
      
      // Load expenses
      await loadExpenses();
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      setLoading(false);
      console.error('Error loading data:', err);
    }
  };

  const loadExpenses = async () => {
    try {
      let expensesData;
      
      // Apply date filter if both dates are selected
      if (startDate && endDate) {
        expensesData = await getExpensesByDateRange(new Date(startDate), new Date(endDate));
      } else {
        // Otherwise load all expenses
        expensesData = await getAllItems('expenses');
      }
      
      setExpenses(expensesData);
    } catch (err) {
      setError('Failed to load expenses. Please try again.');
      console.error('Error loading expenses:', err);
    }
  };

  const handleFilterChange = () => {
    loadExpenses();
  };

  const prepareChartData = () => {
    // Prepare category data for pie chart
    const categoryTotals = {};
    
    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });
    
    const categoryChartData = Object.keys(categoryTotals).map(categoryId => {
      const category = categories.find(cat => cat.id === categoryId);
      return {
        name: category ? category.name : 'Unknown',
        value: categoryTotals[categoryId]
      };
    });
    
    // Sort by value descending
    categoryChartData.sort((a, b) => b.value - a.value);
    
    setCategoryData(categoryChartData);
    
    // Prepare time series data based on selected period
    const timeData = {};
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      let periodKey;
      
      switch (period) {
        case 'daily':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'yearly':
          periodKey = date.getFullYear().toString();
          break;
        default:
          periodKey = date.toISOString().split('T')[0];
      }
      
      if (!timeData[periodKey]) {
        timeData[periodKey] = {
          period: periodKey,
          total: 0
        };
        
        // Initialize category amounts
        categories.forEach(category => {
          timeData[periodKey][category.name] = 0;
        });
      }
      
      const category = categories.find(cat => cat.id === expense.category);
      if (category) {
        timeData[periodKey][category.name] += expense.amount;
      }
      
      timeData[periodKey].total += expense.amount;
    });
    
    // Convert to array and sort by period
    const timeSeriesArray = Object.values(timeData);
    timeSeriesArray.sort((a, b) => a.period.localeCompare(b.period));
    
    setTimeSeriesData(timeSeriesArray);
    
    // Prepare monthly total data for the last 6 months
    const monthlyData = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = {
        month: monthKey,
        total: 0
      };
    }
    
    // Fill in actual data
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].total += expense.amount;
      }
    });
    
    // Convert to array and sort by month
    const monthlyArray = Object.values(monthlyData);
    monthlyArray.sort((a, b) => a.month.localeCompare(b.month));
    
    // Format month labels
    monthlyArray.forEach(item => {
      const [year, month] = item.month.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      item.monthName = date.toLocaleString('default', { month: 'short' });
    });
    
    setMonthlyTotalData(monthlyArray);
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

  const PieChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-semibold">{`${payload[0].name}`}</p>
          <p>{`${formatCurrency(payload[0].value)}`}</p>
          <p>{`${(payload[0].payload.percent * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null;
    
    return (
      <text x={x} y={y} fill="#fff" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Spending Analysis</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Filter controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Start Date
          </label>
          <input
            type="date"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            End Date
          </label>
          <input
            type="date"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Time Period
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleFilterChange}
          >
            Apply Filters
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading analysis...</div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-4">No expense data found for the selected period.</div>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Expenses</h3>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Average Daily Expense</h3>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(
                  expenses.reduce((sum, expense) => sum + expense.amount, 0) / 
                  (startDate && endDate 
                    ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
                    : 30)
                )}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Top Category</h3>
              <p className="text-2xl font-bold text-purple-900">
                {categoryData.length > 0 ? categoryData[0].name : 'N/A'}
              </p>
            </div>
          </div>
          
          {/* Category Distribution */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Spending by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieChartTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Time Series Chart */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Spending Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeSeriesData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="total" name="Total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Monthly Trend */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Monthly Spending Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyTotalData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Monthly Total" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingAnalysis;

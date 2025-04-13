import React, { useState, useEffect } from 'react';
import { getAllItems } from '../../services/databaseService';

const FinancialInsights = () => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [insights, setInsights] = useState([]);
  const [stats, setStats] = useState({
    totalMonthlyExpense: 0,
    averageDailyExpense: 0,
    topExpenseCategory: '',
    savingsRate: 0,
    monthlyIncome: 40000, // Default from user requirements
    monthlyRent: 7000,    // Default from user requirements
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (expenses.length > 0 && categories.length > 0) {
      generateInsights();
      calculateStats();
    }
  }, [expenses, budgets, categories]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesData = await getAllItems('categories');
      setCategories(categoriesData);
      
      // Load expenses
      const expensesData = await getAllItems('expenses');
      setExpenses(expensesData);
      
      // Load budgets
      const budgetsData = await getAllItems('budgets');
      setBudgets(budgetsData);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      setLoading(false);
      console.error('Error loading data:', err);
    }
  };

  const generateInsights = () => {
    const newInsights = [];
    
    // Get current month expenses
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= currentMonthStart;
    });
    
    const totalMonthlyExpense = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Insight 1: Monthly spending trend
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const previousMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= previousMonthStart && expenseDate <= previousMonthEnd;
    });
    
    const previousMonthTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    if (previousMonthTotal > 0) {
      const percentChange = ((totalMonthlyExpense - previousMonthTotal) / previousMonthTotal) * 100;
      
      if (percentChange > 10) {
        newInsights.push({
          type: 'warning',
          title: 'Spending Increase',
          message: `Your spending this month is up by ${percentChange.toFixed(1)}% compared to last month.`,
        });
      } else if (percentChange < -10) {
        newInsights.push({
          type: 'success',
          title: 'Spending Decrease',
          message: `Great job! Your spending this month is down by ${Math.abs(percentChange).toFixed(1)}% compared to last month.`,
        });
      }
    }
    
    // Insight 2: Category spending anomalies
    const categoryTotals = {};
    const categoryAverages = {};
    
    // Calculate 3-month averages for each category
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate >= threeMonthsAgo) {
        if (!categoryTotals[expense.category]) {
          categoryTotals[expense.category] = {
            current: 0,
            previous: 0,
            count: 0
          };
        }
        
        if (expenseDate >= currentMonthStart) {
          categoryTotals[expense.category].current += expense.amount;
        } else {
          categoryTotals[expense.category].previous += expense.amount;
          categoryTotals[expense.category].count += 1;
        }
      }
    });
    
    // Calculate averages and check for anomalies
    Object.keys(categoryTotals).forEach(categoryId => {
      const data = categoryTotals[categoryId];
      if (data.count > 0) {
        const monthlyAverage = data.previous / (data.count / 30); // Approximate monthly average
        const category = categories.find(cat => cat.id === categoryId);
        
        if (category && data.current > monthlyAverage * 1.5) {
          newInsights.push({
            type: 'warning',
            title: `High ${category.name} Spending`,
            message: `Your spending on ${category.name} this month is significantly higher than your average.`,
          });
        }
      }
    });
    
    // Insight 3: Budget alerts
    budgets.forEach(budget => {
      const actual = calculateActualSpending(budget);
      const percentUsed = (actual / budget.amount) * 100;
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const dayOfMonth = now.getDate();
      const monthProgress = (dayOfMonth / daysInMonth) * 100;
      
      const category = categories.find(cat => cat.id === budget.category);
      const categoryName = category ? category.name : 'overall';
      
      if (percentUsed > 90 && monthProgress < 80) {
        newInsights.push({
          type: 'danger',
          title: `Budget Alert: ${budget.name}`,
          message: `You've used ${percentUsed.toFixed(0)}% of your ${categoryName} budget, but we're only ${monthProgress.toFixed(0)}% through the period.`,
        });
      } else if (percentUsed < monthProgress * 0.7 && monthProgress > 50) {
        newInsights.push({
          type: 'success',
          title: `Budget Success: ${budget.name}`,
          message: `You're doing great with your ${categoryName} budget! You've only used ${percentUsed.toFixed(0)}% while we're ${monthProgress.toFixed(0)}% through the period.`,
        });
      }
    });
    
    // Insight 4: Savings potential
    const monthlyIncome = 40000; // From user requirements
    const monthlyRent = 7000;    // From user requirements
    const essentialCategories = ['Housing', 'Utilities', 'Food', 'Transportation', 'Healthcare'];
    
    const essentialCategoryIds = categories
      .filter(cat => essentialCategories.includes(cat.name))
      .map(cat => cat.id);
    
    const essentialExpenses = currentMonthExpenses
      .filter(expense => essentialCategoryIds.includes(expense.category))
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const discretionaryExpenses = totalMonthlyExpense - essentialExpenses;
    const currentSavings = monthlyIncome - totalMonthlyExpense;
    const savingsRate = (currentSavings / monthlyIncome) * 100;
    
    if (savingsRate < 20 && discretionaryExpenses > 0.3 * monthlyIncome) {
      newInsights.push({
        type: 'info',
        title: 'Savings Opportunity',
        message: `You're currently saving ${savingsRate.toFixed(1)}% of your income. Consider reducing discretionary spending to reach a 20% savings rate.`,
      });
    } else if (savingsRate >= 20) {
      newInsights.push({
        type: 'success',
        title: 'Healthy Savings Rate',
        message: `Great job! You're saving ${savingsRate.toFixed(1)}% of your income, which is above the recommended 20%.`,
      });
    }
    
    setInsights(newInsights);
  };

  const calculateStats = () => {
    // Get current month expenses
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= currentMonthStart;
    });
    
    const totalMonthlyExpense = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const dayOfMonth = now.getDate();
    const averageDailyExpense = totalMonthlyExpense / dayOfMonth;
    
    // Find top expense category
    const categoryTotals = {};
    currentMonthExpenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });
    
    let topCategoryId = '';
    let topCategoryAmount = 0;
    
    Object.keys(categoryTotals).forEach(categoryId => {
      if (categoryTotals[categoryId] > topCategoryAmount) {
        topCategoryAmount = categoryTotals[categoryId];
        topCategoryId = categoryId;
      }
    });
    
    const topCategory = categories.find(cat => cat.id === topCategoryId);
    const topCategoryName = topCategory ? topCategory.name : 'Unknown';
    
    // Calculate savings rate
    const monthlyIncome = 40000; // From user requirements
    const currentSavings = monthlyIncome - totalMonthlyExpense;
    const savingsRate = (currentSavings / monthlyIncome) * 100;
    
    setStats({
      totalMonthlyExpense,
      averageDailyExpense,
      topExpenseCategory: topCategoryName,
      savingsRate,
      monthlyIncome,
      monthlyRent: 7000 // From user requirements
    });
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

  const getInsightClass = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'info':
      default:
        return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Financial Insights Dashboard</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">Loading insights...</div>
      ) : (
        <div className="space-y-8">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Monthly Income</h3>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(stats.monthlyIncome)}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Monthly Expenses</h3>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(stats.totalMonthlyExpense)}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Monthly Savings</h3>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(stats.monthlyIncome - stats.totalMonthlyExpense)}
              </p>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Savings Rate</h3>
              <p className="text-xl font-bold text-gray-800">
                {stats.savingsRate.toFixed(1)}%
              </p>
            </div>
            
            <div className="p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Rent to Income Ratio</h3>
              <p className="text-xl font-bold text-gray-800">
                {((stats.monthlyRent / stats.monthlyIncome) * 100).toFixed(1)}%
              </p>
            </div>
            
            <div className="p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Daily Average Expense</h3>
              <p className="text-xl font-bold text-gray-800">
                {formatCurrency(stats.averageDailyExpense)}
              </p>
            </div>
            
            <div className="p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Top Expense Category</h3>
              <p className="text-xl font-bold text-gray-800">
                {stats.topExpenseCategory}
              </p>
            </div>
          </div>
          
          {/* Financial Insights */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Personalized Insights</h3>
            
            {insights.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                Add more financial data to generate personalized insights.
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div 
                    key={index} 
                    className={`border px-4 py-3 rounded ${getInsightClass(insight.type)}`}
                  >
                    <strong className="font-bold">{insight.title}: </strong>
                    <span>{insight.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Financial Tips */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Financial Tips</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Aim to save at least 20% of your income each month.</span>
 
(Content truncated due to size limit. Use line ranges to read in chunks)
import React, { useState, useEffect } from 'react';
import { getAllItems } from '../../services/databaseService';

const BudgetAlerts = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

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
      
      // Generate alerts
      generateAlerts(budgetsData, categoriesData, expensesData);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      setLoading(false);
      console.error('Error loading data:', err);
    }
  };

  const generateAlerts = (budgets, categories, expenses) => {
    const newAlerts = [];
    
    budgets.forEach(budget => {
      const progress = calculateBudgetProgress(budget, expenses);
      const categoryName = getCategoryName(budget.category, categories);
      
      // Alert if over budget
      if (progress.percentage >= 100) {
        newAlerts.push({
          id: `over-${budget.id}`,
          type: 'danger',
          title: 'Budget Exceeded',
          message: `Your ${budget.name} budget (${categoryName}) has been exceeded. You've spent ${formatCurrency(progress.spent)} of your ${formatCurrency(budget.amount)} budget.`,
        });
      }
      // Warning if approaching budget limit
      else if (progress.percentage >= 80) {
        newAlerts.push({
          id: `warning-${budget.id}`,
          type: 'warning',
          title: 'Budget Warning',
          message: `Your ${budget.name} budget (${categoryName}) is at ${progress.percentage.toFixed(0)}%. You have ${formatCurrency(progress.remaining)} remaining.`,
        });
      }
    });
    
    setAlerts(newAlerts);
  };

  const calculateBudgetProgress = (budget, expenses) => {
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
    const totalSpent = relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate percentage
    const percentage = (totalSpent / budget.amount) * 100;
    
    return {
      spent: totalSpent,
      remaining: budget.amount - totalSpent,
      percentage: Math.min(percentage, 100) // Cap at 100%
    };
  };

  const getCategoryName = (categoryId, categories) => {
    if (!categoryId) return 'All Categories';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getAlertClass = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-700';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Budget Alerts</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-4 bg-green-100 border border-green-400 text-green-700 px-4 rounded">
          No budget alerts at this time. You're doing great!
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`border px-4 py-3 rounded relative ${getAlertClass(alert.type)}`}
            >
              <strong className="font-bold">{alert.title}: </strong>
              <span className="block sm:inline">{alert.message}</span>
              <button
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => dismissAlert(alert.id)}
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={loadData}
        >
          Refresh Alerts
        </button>
      </div>
    </div>
  );
};

export default BudgetAlerts;

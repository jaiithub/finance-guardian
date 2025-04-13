import React, { useState, useEffect } from 'react';
import { getAllItems, getExpensesByCategory, getExpensesByDateRange, deleteItem } from '../../services/databaseService';

const BudgetList = ({ refreshTrigger }) => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteItem('budgets', id);
        // Refresh budgets list
        await loadData();
      } catch (err) {
        setError('Failed to delete budget. Please try again.');
        console.error('Error deleting budget:', err);
      }
    }
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'All Categories';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Ongoing';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const calculateBudgetProgress = (budget) => {
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

  const getBudgetStatusClass = (progress) => {
    const percentage = progress.percentage;
    if (percentage >= 100) return 'bg-red-500'; // Over budget
    if (percentage >= 75) return 'bg-yellow-500'; // Warning
    return 'bg-green-500'; // Good
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Budgets</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">Loading budgets...</div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-4">No budgets found. Create a budget to get started!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            const progress = calculateBudgetProgress(budget);
            const statusClass = getBudgetStatusClass(progress);
            
            return (
              <div key={budget.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{budget.name}</h3>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(budget.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-gray-600">{getCategoryName(budget.category)}</p>
                  <p className="text-gray-600">
                    {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget
                  </p>
                  <p className="text-gray-600">
                    {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                  </p>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Budget: {formatCurrency(budget.amount)}</span>
                    <span className={progress.percentage >= 100 ? 'text-red-600 font-bold' : ''}>
                      {progress.percentage.toFixed(0)}% used
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                      className={`h-2.5 rounded-full ${statusClass}`} 
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Spent</p>
                      <p className="font-semibold">{formatCurrency(progress.spent)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remaining</p>
                      <p className={`font-semibold ${progress.remaining < 0 ? 'text-red-600' : ''}`}>
                        {formatCurrency(progress.remaining)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetList;

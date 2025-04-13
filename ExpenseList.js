import React, { useState, useEffect } from 'react';
import { getAllItems, getExpensesByDateRange, getExpensesByCategory, deleteItem } from '../../services/databaseService';

const ExpenseList = ({ refreshTrigger }) => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    // Load expenses and categories
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
    
    loadData();
  }, [refreshTrigger]);
  
  const loadExpenses = async () => {
    try {
      let expensesData;
      
      // Apply date filter if both dates are selected
      if (startDate && endDate) {
        expensesData = await getExpensesByDateRange(new Date(startDate), new Date(endDate));
      } 
      // Apply category filter if selected
      else if (selectedCategory) {
        expensesData = await getExpensesByCategory(selectedCategory);
      } 
      // Otherwise load all expenses
      else {
        expensesData = await getAllItems('expenses');
      }
      
      // Sort expenses
      expensesData.sort((a, b) => {
        if (sortBy === 'date') {
          return sortOrder === 'asc' 
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'amount') {
          return sortOrder === 'asc' 
            ? a.amount - b.amount
            : b.amount - a.amount;
        }
        return 0;
      });
      
      setExpenses(expensesData);
    } catch (err) {
      setError('Failed to load expenses. Please try again.');
      console.error('Error loading expenses:', err);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteItem('expenses', id);
        // Refresh expenses list
        await loadExpenses();
      } catch (err) {
        setError('Failed to delete expense. Please try again.');
        console.error('Error deleting expense:', err);
      }
    }
  };
  
  const handleFilterChange = () => {
    loadExpenses();
  };
  
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortBy(field);
      setSortOrder('desc');
    }
    
    // Apply sorting
    loadExpenses();
  };
  
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Expense History</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Filter controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
            Category
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleFilterChange}
        >
          Apply Filters
        </button>
        
        <button
          className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => {
            setStartDate('');
            setEndDate('');
            setSelectedCategory('');
            setSortBy('date');
            setSortOrder('desc');
            loadExpenses();
          }}
        >
          Reset Filters
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-4">No expenses found. Add some expenses to get started!</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left cursor-pointer" onClick={() => handleSortChange('date')}>
                  Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3 px-6 text-left">Category</th>
                <th className="py-3 px-6 text-left">Description</th>
                <th className="py-3 px-6 text-right cursor-pointer" onClick={() => handleSortChange('amount')}>
                  Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3 px-6 text-center">Payment Method</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {formatDate(expense.date)}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {getCategoryName(expense.category)}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {expense.description || '-'}
                  </td>
                  <td className="py-3 px-6 text-right">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {expense.paymentMethod.charAt(0).toUpperCase() + expense.paymentMethod.slice(1)}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(expense.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;

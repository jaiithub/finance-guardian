import React, { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import CategoryManager from './CategoryManager';
import { getAllItems, initializeDefaultData } from '../../services/databaseService';

const ExpenseTracker = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [categories, setCategories] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if we have categories already
        const existingCategories = await getAllItems('categories');
        
        if (existingCategories.length === 0) {
          // Initialize default data if no categories exist
          await initializeDefaultData();
          setIsInitialized(true);
        }
        
        // Load categories
        const categoriesData = await getAllItems('categories');
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    
    initialize();
  }, []);

  const handleExpenseAdded = () => {
    // Trigger a refresh of the expense list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Expense Tracker</h1>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'add' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('add')}
          >
            Add Expense
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'history' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Expense History
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'categories' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('categories')}
          >
            Manage Categories
          </button>
        </div>
      </div>
      
      {activeTab === 'add' && (
        <ExpenseForm 
          onExpenseAdded={handleExpenseAdded} 
          categories={categories} 
        />
      )}
      
      {activeTab === 'history' && (
        <ExpenseList 
          refreshTrigger={refreshTrigger} 
        />
      )}
      
      {activeTab === 'categories' && (
        <CategoryManager />
      )}
    </div>
  );
};

export default ExpenseTracker;

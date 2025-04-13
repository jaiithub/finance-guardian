import React, { useState, useEffect } from 'react';
import BudgetForm from './BudgetForm';
import BudgetList from './BudgetList';
import BudgetAlerts from './BudgetAlerts';
import { getAllItems } from '../../services/databaseService';

const BudgetManager = () => {
  const [activeTab, setActiveTab] = useState('budgets');
  const [categories, setCategories] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Load categories
    const loadCategories = async () => {
      try {
        const categoriesData = await getAllItems('categories');
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  const handleBudgetAdded = () => {
    // Trigger a refresh of the budget list and alerts
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Budget Manager</h1>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'budgets' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('budgets')}
          >
            Your Budgets
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'create' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create Budget
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'alerts' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('alerts')}
          >
            Budget Alerts
          </button>
        </div>
      </div>
      
      {activeTab === 'budgets' && (
        <BudgetList 
          refreshTrigger={refreshTrigger} 
        />
      )}
      
      {activeTab === 'create' && (
        <BudgetForm 
          onBudgetAdded={handleBudgetAdded} 
          categories={categories} 
        />
      )}
      
      {activeTab === 'alerts' && (
        <BudgetAlerts />
      )}
    </div>
  );
};

export default BudgetManager;

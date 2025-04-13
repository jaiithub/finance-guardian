import React, { useState } from 'react';
import SpendingAnalysis from './SpendingAnalysis';
import BudgetComparison from './BudgetComparison';
import FinancialInsights from './FinancialInsights';

const ReportingDashboard = () => {
  const [activeTab, setActiveTab] = useState('insights');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Financial Reports & Analytics</h1>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'insights' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('insights')}
          >
            Financial Insights
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'spending' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('spending')}
          >
            Spending Analysis
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'budget' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('budget')}
          >
            Budget Comparison
          </button>
        </div>
      </div>
      
      {activeTab === 'insights' && (
        <FinancialInsights />
      )}
      
      {activeTab === 'spending' && (
        <SpendingAnalysis />
      )}
      
      {activeTab === 'budget' && (
        <BudgetComparison />
      )}
    </div>
  );
};

export default ReportingDashboard;

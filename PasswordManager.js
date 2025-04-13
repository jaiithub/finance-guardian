import React, { useState, useEffect } from 'react';
import PasswordForm from './PasswordForm';
import PasswordList from './PasswordList';

const PasswordManager = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePasswordAdded = () => {
    // Trigger a refresh of the password list
    setRefreshTrigger(prev => prev + 1);
    // Switch to list view after adding a password
    setActiveTab('list');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Password Manager</h1>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'list' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('list')}
          >
            Your Passwords
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'add' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('add')}
          >
            Add Password
          </button>
        </div>
      </div>
      
      {activeTab === 'list' && (
        <PasswordList 
          refreshTrigger={refreshTrigger} 
        />
      )}
      
      {activeTab === 'add' && (
        <PasswordForm 
          onPasswordAdded={handlePasswordAdded} 
        />
      )}
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Password Security Tips</h3>
        <ul className="list-disc pl-5 text-blue-800">
          <li>Use a unique password for each account</li>
          <li>Create strong passwords with a mix of letters, numbers, and symbols</li>
          <li>Update your passwords regularly</li>
          <li>Never share your passwords with others</li>
          <li>Consider using a different master PIN for highly sensitive passwords</li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordManager;

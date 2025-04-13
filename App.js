import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ExpenseTracker from './components/expenses/ExpenseTracker';
import BudgetManager from './components/budgets/BudgetManager';
import PasswordManager from './components/passwords/PasswordManager';
import ReportingDashboard from './components/reports/ReportingDashboard';
import { initDatabase } from './services/databaseService';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Initialize database on app load
  React.useEffect(() => {
    const initApp = async () => {
      try {
        await initDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };
    
    initApp();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="font-bold text-xl">FinanceGuardian</span>
                </div>
              </div>
              
              {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-700 focus:outline-none"
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
              
              {/* Desktop menu */}
              <div className="hidden md:flex md:items-center md:space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Expenses</Link>
                <Link to="/budgets" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Budgets</Link>
                <Link to="/passwords" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Passwords</Link>
                <Link to="/reports" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Reports</Link>
              </div>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link 
                  to="/" 
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Expenses
                </Link>
                <Link 
                  to="/budgets" 
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Budgets
                </Link>
                <Link 
                  to="/passwords" 
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Passwords
                </Link>
                <Link 
                  to="/reports" 
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Reports
                </Link>
              </div>
            </div>
          )}
        </nav>
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<ExpenseTracker />} />
            <Route path="/budgets" element={<BudgetManager />} />
            <Route path="/passwords" element={<PasswordManager />} />
            <Route path="/reports" element={<ReportingDashboard />} />
          </Routes>
        </main>
        
        <footer className="bg-white py-4 shadow-inner mt-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p>FinanceGuardian - Secure Expense Tracking & Password Management</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;

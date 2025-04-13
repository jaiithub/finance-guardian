import React, { useState, useEffect } from 'react';
import { getAllItems, deleteItem, decryptData } from '../../services/databaseService';

const PasswordList = ({ refreshTrigger }) => {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [masterPin, setMasterPin] = useState('');
  const [pinConfirmed, setPinConfirmed] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState(null);
  const [decryptedData, setDecryptedData] = useState({});
  const [showPassword, setShowPassword] = useState({});

  useEffect(() => {
    if (pinConfirmed) {
      loadPasswords();
    }
  }, [refreshTrigger, pinConfirmed]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!masterPin || masterPin.length < 4) {
      setError('Please enter a PIN with at least 4 digits');
      return;
    }
    setPinConfirmed(true);
    setError('');
  };

  const loadPasswords = async () => {
    try {
      setLoading(true);
      const passwordsData = await getAllItems('passwords');
      setPasswords(passwordsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load passwords. Please try again.');
      setLoading(false);
      console.error('Error loading passwords:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this password?')) {
      try {
        await deleteItem('passwords', id);
        // Refresh passwords list
        await loadPasswords();
      } catch (err) {
        setError('Failed to delete password. Please try again.');
        console.error('Error deleting password:', err);
      }
    }
  };

  const handleView = (password) => {
    setSelectedPassword(password);
    
    // Decrypt the data
    try {
      const decryptedUsername = decryptData(password.username, masterPin);
      const decryptedPassword = decryptData(password.password, masterPin);
      const decryptedNotes = password.notes ? decryptData(password.notes, masterPin) : '';
      
      if (!decryptedUsername || !decryptedPassword) {
        setError('Failed to decrypt data. Please check your master PIN.');
        return;
      }
      
      setDecryptedData({
        ...password,
        username: decryptedUsername,
        password: decryptedPassword,
        notes: decryptedNotes
      });
      
      setError('');
    } catch (err) {
      setError('Failed to decrypt data. Please check your master PIN.');
      console.error('Error decrypting data:', err);
    }
  };

  const toggleShowPassword = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const calculateDaysUntilExpiry = (updatedDate, expiryReminder) => {
    const updateDate = new Date(updatedDate);
    const expiryDate = new Date(updateDate.setDate(updateDate.getDate() + expiryReminder));
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatusClass = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 0) return 'text-red-600 font-bold';
    if (daysUntilExpiry <= 7) return 'text-yellow-600 font-bold';
    return 'text-green-600';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  if (!pinConfirmed) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Enter Master PIN</h2>
        <p className="mb-4 text-gray-600">
          Please enter your master PIN to view your passwords.
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handlePinSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="masterPin">
              Master PIN
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="masterPin"
              type="password"
              placeholder="Enter your master PIN"
              value={masterPin}
              onChange={(e) => setMasterPin(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Confirm PIN
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Passwords</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">Loading passwords...</div>
      ) : passwords.length === 0 ? (
        <div className="text-center py-4">No passwords found. Add some passwords to get started!</div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Title</th>
                  <th className="py-3 px-6 text-left">Last Updated</th>
                  <th className="py-3 px-6 text-left">Expiry Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {passwords.map((password) => {
                  const daysUntilExpiry = calculateDaysUntilExpiry(
                    password.updatedDate, 
                    password.expiryReminder
                  );
                  const expiryStatusClass = getExpiryStatusClass(daysUntilExpiry);
                  
                  return (
                    <tr key={password.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        {password.title}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {formatDate(password.updatedDate)}
                      </td>
                      <td className={`py-3 px-6 text-left ${expiryStatusClass}`}>
                        {daysUntilExpiry <= 0 
                          ? 'Expired' 
                          : `${daysUntilExpiry} days remaining`}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          className="text-blue-500 hover:text-blue-700 mr-3"
                          onClick={() => handleView(password)}
                        >
                          View
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(password.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {selectedPassword && decryptedData.username && (
            <div className="mt-8 p-4 border rounded-lg">
              <h3 className="text-xl font-bold mb-4">{selectedPassword.title} Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Username / Email:</p>
                  <div className="flex items-center mt-1">
                    <p className="font-semibold">{decryptedData.username}</p>
                    <button
                      className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
                      onClick={() => copyToClipboard(decryptedData.username)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-600">Password:</p>
                  <div className="flex items-center mt-1">
                    <p className="font-semibold">
                      {showPassword[selectedPassword.id] 
                        ? decryptedData.password 
                        : '••••••••••••••••'}
                    </p>
                    <button
                      className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
                      onClick={() => toggleShowPassword(selectedPassword.id)}
                    >
                      {showPassword[selectedPassword.id] ? 'Hide' : 'Show'}
                    </button>
                    <button
                      className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
                      onClick={() => copyToClipboard(decryptedData.password)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                {selectedPassword.url && (
                  <div className="col-span-2">
                    <p className="text-gray-600">Website URL:</p>
                    <p className="font-semibold mt-1">
                      <a 
                        href={selectedPassword.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        {selectedPassword.url}
                      </a>
                    </p>
                  </div>
                )}
                
                {decryptedData.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-600">Notes:</p>
                    <p className="mt-1">{decryptedData.notes}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-gray-600">Created Date:</p>
                  <p className="font-semibold mt-1">{formatDate(selectedPassword.createdDate)}</p>
                </div>
                
                <div>
                  <p className="text-gray-600">Last Updated:</p>
                  <p className="font-semibold mt-1">{formatDate(selectedPassword.updatedDate)}</p>
                </div>
                
                <div className="col-span-2">
                  <p className="text-gray-600">Password Expiry:</p>
                  <p className={`font-semibold mt-1 ${expiryStatusClass}`}>
                    {daysUntilExpiry <= 0 
                      ? 'Password has expired. Please update it.' 
                      : `Password will expire in ${daysUntilExpiry} days.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordList;

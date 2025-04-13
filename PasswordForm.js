import React, { useState } from 'react';
import { addItem, encryptData } from '../../services/databaseService';

const PasswordForm = ({ onPasswordAdded }) => {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [expiryReminder, setExpiryReminder] = useState(90);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [masterPin, setMasterPin] = useState('');
  const [pinConfirmed, setPinConfirmed] = useState(false);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!masterPin || masterPin.length < 4) {
      setError('Please enter a PIN with at least 4 digits');
      return;
    }
    setPinConfirmed(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate input
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      // Encrypt sensitive data
      const encryptedUsername = encryptData(username, masterPin);
      const encryptedPassword = encryptData(password, masterPin);
      const encryptedNotes = notes ? encryptData(notes, masterPin) : '';

      // Create password object
      const passwordEntry = {
        title,
        username: encryptedUsername,
        password: encryptedPassword,
        url,
        notes: encryptedNotes,
        createdDate: new Date(),
        updatedDate: new Date(),
        expiryReminder: parseInt(expiryReminder)
      };

      // Add password to database
      await addItem('passwords', passwordEntry);
      
      // Clear form
      setTitle('');
      setUsername('');
      setPassword('');
      setUrl('');
      setNotes('');
      setExpiryReminder(90);
      
      // Show success message
      setSuccess('Password added successfully!');
      
      // Notify parent component
      if (onPasswordAdded) {
        onPasswordAdded();
      }
    } catch (error) {
      setError('Failed to add password. Please try again.');
      console.error('Error adding password:', error);
    }
  };

  const generatePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let generatedPassword = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }
    setPassword(generatedPassword);
  };

  if (!pinConfirmed) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Set Master PIN</h2>
        <p className="mb-4 text-gray-600">
          Please set a master PIN to encrypt your passwords. You'll need this PIN to view your passwords later.
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
      <h2 className="text-2xl font-bold mb-4">Add New Password</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Title
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="e.g., Gmail, Facebook, Bank Account"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username / Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Enter username or email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <div className="flex">
            <input
              className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="mt-2">
            <button
              type="button"
              className="text-blue-500 hover:text-blue-700 text-sm"
              onClick={generatePassword}
            >
              Generate Strong Password
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
            Website URL (Optional)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="url"
            type="text"
            placeholder="e.g., https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            Notes (Optional)
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="notes"
            placeholder="Add any additional notes"
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expiryReminder">
            Password Expiry Reminder (days)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="expiryReminder"
            type="number"
            min="1"
            value={expiryReminder}
            onChange={(e) => setExpiryReminder(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-1">You'll be reminded to update this password after this many days</p>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Save Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordForm;

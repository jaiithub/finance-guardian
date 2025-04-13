import React, { useState, useEffect } from 'react';
import { getAllItems, addItem, updateItem, deleteItem } from '../../services/databaseService';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // New category form state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#4B89DC');
  const [type, setType] = useState('expense');
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);
  
  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getAllItems('categories');
      setCategories(categoriesData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load categories. Please try again.');
      setLoading(false);
      console.error('Error loading categories:', err);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate input
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    
    // Check for duplicate name
    const duplicate = categories.find(
      cat => cat.name.toLowerCase() === name.toLowerCase() && 
      (editMode ? cat.id !== editId : true)
    );
    
    if (duplicate) {
      setError('A category with this name already exists');
      return;
    }
    
    try {
      if (editMode) {
        // Update existing category
        await updateItem('categories', {
          id: editId,
          name,
          icon,
          color,
          type
        });
        setSuccess('Category updated successfully!');
        setEditMode(false);
        setEditId(null);
      } else {
        // Add new category
        await addItem('categories', {
          name,
          icon,
          color,
          type
        });
        setSuccess('Category added successfully!');
      }
      
      // Reset form
      setName('');
      setIcon('');
      setColor('#4B89DC');
      setType('expense');
      
      // Reload categories
      await loadCategories();
    } catch (err) {
      setError(editMode ? 'Failed to update category' : 'Failed to add category');
      console.error('Error with category:', err);
    }
  };
  
  const handleEdit = (category) => {
    setName(category.name);
    setIcon(category.icon);
    setColor(category.color);
    setType(category.type);
    setEditId(category.id);
    setEditMode(true);
    setError('');
    setSuccess('');
  };
  
  const handleCancel = () => {
    setName('');
    setIcon('');
    setColor('#4B89DC');
    setType('expense');
    setEditId(null);
    setEditMode(false);
    setError('');
    setSuccess('');
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This may affect existing expenses.')) {
      try {
        await deleteItem('categories', id);
        setSuccess('Category deleted successfully!');
        await loadCategories();
      } catch (err) {
        setError('Failed to delete category. Please try again.');
        console.error('Error deleting category:', err);
      }
    }
  };
  
  // List of common icons for selection
  const iconOptions = [
    { value: 'home', label: 'Home' },
    { value: 'restaurant', label: 'Food' },
    { value: 'directions_car', label: 'Car' },
    { value: 'movie', label: 'Entertainment' },
    { value: 'shopping_cart', label: 'Shopping' },
    { value: 'power', label: 'Utilities' },
    { value: 'local_hospital', label: 'Healthcare' },
    { value: 'school', label: 'Education' },
    { value: 'person', label: 'Personal' },
    { value: 'work', label: 'Work' },
    { value: 'card_giftcard', label: 'Gift' },
    { value: 'more_horiz', label: 'Other' }
  ];
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{editMode ? 'Edit Category' : 'Add New Category'}</h2>
      
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
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Category Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="icon">
            Icon
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          >
            <option value="">Select an icon</option>
            {iconOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="color">
            Color
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
            Type
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            {editMode ? 'Update Category' : 'Add Category'}
          </button>
          
          {editMode && (
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <h3 className="text-xl font-bold mb-4">Categories</h3>
      
      {loading ? (
        <div className="text-center py-4">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-4">No categories found. Add some categories to get started!</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Icon</th>
                <th className="py-3 px-6 text-left">Color</th>
                <th className="py-3 px-6 text-left">Type</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {category.name}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {category.icon || '-'}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      {category.color}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      className="text-blue-500 hover:text-blue-700 mr-3"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(category.id)}
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

export default CategoryManager;

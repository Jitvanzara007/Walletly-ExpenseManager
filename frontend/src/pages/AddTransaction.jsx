import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUtensils, 
  faCar, 
  faBolt, 
  faHome, 
  faFilm, 
  faShoppingBag, 
  faHeartbeat, 
  faGraduationCap, 
  faMoneyBillWave, 
  faEllipsisH,
  faArrowLeft,
  faSave
} from '@fortawesome/free-solid-svg-icons';

const CATEGORIES = [
  { name: 'Food', icon: faUtensils },
  { name: 'Transport', icon: faCar },
  { name: 'Utilities', icon: faBolt },
  { name: 'Housing', icon: faHome },
  { name: 'Entertainment', icon: faFilm },
  { name: 'Shopping', icon: faShoppingBag },
  { name: 'Healthcare', icon: faHeartbeat },
  { name: 'Education', icon: faGraduationCap },
  { name: 'Income', icon: faMoneyBillWave },
  { name: 'Other', icon: faEllipsisH }
];

const AddTransaction = () => {
  const navigate = useNavigate();
  const { createTransaction } = useExpense();
  const { getCurrencySymbol } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/expenses')}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Expenses
          </button>
          <h1 className="text-2xl font-bold text-white">Add New Transaction</h1>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 bg-opacity-50 rounded-xl p-6 shadow-xl"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  formData.type === 'expense'
                    ? 'border-red-500 bg-red-500 bg-opacity-20 text-red-400'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  formData.type === 'income'
                    ? 'border-green-500 bg-green-500 bg-opacity-20 text-green-400'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                Income
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter transaction title"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {getCurrencySymbol()}
                </span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map(category => (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.name }))}
                    className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                      formData.category === category.name
                        ? 'border-indigo-500 bg-indigo-500 bg-opacity-20 text-indigo-400'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <FontAwesomeIcon icon={category.icon} />
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faSave} />
              <span>{loading ? 'Saving...' : 'Save Transaction'}</span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddTransaction; 
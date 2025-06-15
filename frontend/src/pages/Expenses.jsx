import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faTrash, 
  faEdit, 
  faSearch, 
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faChartPie,
  faCalendarAlt,
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
  faTimes,
  faWallet,
  faArrowDown,
  faArrowUp,
  faTag,
  faCalendarDay,
  faCreditCard,
  faMoneyBill,
  faMobileAlt,
  faUniversity,
  faChevronDown,
  faBriefcase,
  faChartLine,
  faLaptopCode,
  faGift
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ResponsiveContainer, PieChart, Pie } from 'recharts';

const CATEGORY_ICONS = {
  // Expense categories
  food: faUtensils,
  transport: faCar,
  utilities: faBolt,
  housing: faHome,
  entertainment: faFilm,
  shopping: faShoppingBag,
  healthcare: faHeartbeat,
  education: faGraduationCap,
  other: faEllipsisH,
  // Income categories
  salary: faMoneyBillWave,
  business: faBriefcase,
  investment: faChartLine,
  freelance: faLaptopCode,
  gifts: faGift,
  other_income: faMoneyBill
};

const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food' },
  { id: 'transport', name: 'Transport' },
  { id: 'utilities', name: 'Utilities' },
  { id: 'housing', name: 'Housing' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'education', name: 'Education' },
  { id: 'other', name: 'Other' }
];

const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary' },
  { id: 'business', name: 'Business' },
  { id: 'investment', name: 'Investment' },
  { id: 'freelance', name: 'Freelance' },
  { id: 'gifts', name: 'Gifts' },
  { id: 'other_income', name: 'Other Income' }
];

const CATEGORY_COLORS = {
  // Expense categories
  food: 'bg-orange-500',
  transport: 'bg-blue-500',
  utilities: 'bg-yellow-500',
  housing: 'bg-purple-500',
  entertainment: 'bg-pink-500',
  shopping: 'bg-green-500',
  healthcare: 'bg-red-500',
  education: 'bg-indigo-500',
  other: 'bg-gray-500',
  // Income categories
  salary: 'bg-green-600',
  business: 'bg-emerald-500',
  investment: 'bg-teal-500',
  freelance: 'bg-cyan-500',
  gifts: 'bg-blue-400',
  other_income: 'bg-blue-300'
};

const SORT_OPTIONS = {
  date_asc: { label: 'Date (Oldest)', field: 'date', direction: 'asc' },
  date_desc: { label: 'Date (Newest)', field: 'date', direction: 'desc' },
  amount_asc: { label: 'Amount (Low to High)', field: 'amount', direction: 'asc' },
  amount_desc: { label: 'Amount (High to Low)', field: 'amount', direction: 'desc' }
};

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: faMoneyBill },
  { id: 'card', label: 'Card', icon: faCreditCard },
  { id: 'upi', label: 'UPI', icon: faMobileAlt },
  { id: 'bank', label: 'Bank Transfer', icon: faUniversity }
];

const Expenses = () => {
  const navigate = useNavigate();
  const { 
    transactions,
    loading: contextLoading,
    error: contextError,
    getTransactions, 
    createTransaction,
    deleteTransaction,
    updateTransaction,
    getTransactionSummary 
  } = useExpense();
  const { formatAmount, convertAmount, selectedCurrency } = useCurrency();
  
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [showPaymentSelect, setShowPaymentSelect] = useState(false);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  // Get today's date in YYYY-MM-DD format, adjusted for timezone
  const getTodayDate = () => {
    const today = new Date();
    // Adjust for timezone offset
    const offset = today.getTimezoneOffset();
    const adjustedDate = new Date(today.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  };

  // Get max date (today)
  const getMaxDate = () => {
    return getTodayDate();
  };

  // Initialize form data with today's date
  const [formData, setFormData] = useState({
    type: 'expense',
    description: '',
    amount: '',
    category: '',
    date: getTodayDate(),
    paymentMethod: 'cash'
  });

  // Reset form when type changes
  useEffect(() => {
    if (formData.type === 'expense') {
      setFormData(prev => ({
        ...prev,
        category: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        category: ''
      }));
    }
  }, [formData.type]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching initial data in Expenses component...');
        const dashboardData = await getTransactions();
        console.log('Dashboard data received:', dashboardData);
        
        // Set summary data
        if (dashboardData) {
          setSummary({
            total_income: dashboardData.total_income || 0,
            total_expenses: dashboardData.total_expenses || 0,
            balance: dashboardData.balance || 0,
            category_totals: dashboardData.category_totals || {}
          });
        }
      } catch (err) {
        console.error('Error fetching expense data:', err);
      }
    };

    fetchData();
  }, []);

  // Update filtered transactions when transactions or filters change
  useEffect(() => {
    console.log('Updating filtered transactions. Current transactions:', transactions);
    let filtered = [...transactions];

    // Apply search filter with improved matching
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower) ||
        t.paymentMethod?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Apply sorting
    const { field, direction } = SORT_OPTIONS[sortBy];
    filtered.sort((a, b) => {
      if (field === 'date') {
        return direction === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      return direction === 'asc' 
        ? a[field] - b[field]
        : b[field] - a[field];
    });

    console.log('Filtered transactions:', filtered);
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, selectedCategory, sortBy]);

  // Calculate category totals whenever transactions change
  useEffect(() => {
    const totals = {};
    const budgets = {};
    
    // Initialize all categories with 0
    [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].forEach(cat => {
      totals[cat.id] = 0;
      budgets[cat.id] = localStorage.getItem(`budget_${cat.id}`) || 0;
    });

    // Calculate totals from transactions
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount;
      }
    });

    setCategoryTotals(totals);
    setCategoryBudgets(budgets);
  }, [transactions]);

  // Update amounts when currency changes
  useEffect(() => {
    const handleCurrencyChange = () => {
      // Force re-render of components that display amounts
      setRefreshTrigger(prev => !prev);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If type is changing, reset the category
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        category: '' // Reset category when type changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate date is not in the future, with timezone adjustment
      const selectedDate = new Date(formData.date);
      const today = new Date();
      // Set both dates to midnight in local timezone
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        toast.error('Cannot add transactions for future dates');
        return;
      }

      // Validate category is selected
      if (!formData.category) {
        toast.error('Please select a category');
        return;
      }
      
      const newTransaction = await createTransaction({
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        description: formData.description || 'No description',
        paymentMethod: formData.paymentMethod || 'cash'
      });
      
      console.log('Transaction created successfully:', newTransaction);
      toast.success('Transaction added successfully');
      setShowAddModal(false);
      
      // Refresh both transactions and dashboard data
      await Promise.all([
        getTransactions(),
        getTransactionSummary()
      ]);
      
      // Reset form data
      setFormData({
        type: 'expense',
        description: '',
        amount: '',
        category: '',
        date: getTodayDate(),
        paymentMethod: 'cash'
      });
    } catch (err) {
      console.error('Error creating transaction:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create transaction';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    console.log('Editing transaction:', transaction);
    setSelectedTransaction(transaction);
    setFormData({
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category,
      date: new Date(transaction.date).toISOString().split('T')[0],
      paymentMethod: transaction.paymentMethod
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate date is not in the future, with timezone adjustment
      const selectedDate = new Date(formData.date);
      const today = new Date();
      // Set both dates to midnight in local timezone
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        toast.error('Cannot add transactions for future dates');
        return;
      }

      // Validate category is selected
      if (!formData.category) {
        toast.error('Please select a category');
        return;
      }
      
      const updatedTransaction = await updateTransaction(selectedTransaction._id, {
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        description: formData.description || 'No description',
        paymentMethod: formData.paymentMethod || 'cash'
      });
      
      console.log('Transaction updated successfully:', updatedTransaction);
      toast.success('Transaction updated successfully');
      setShowEditModal(false);
      
      // Refresh both transactions and dashboard data
      await Promise.all([
        getTransactions(),
        getTransactionSummary()
      ]);
      
      // Reset form data
      setFormData({
        type: 'expense',
        description: '',
        amount: '',
        category: '',
        date: getTodayDate(),
        paymentMethod: 'cash'
      });
    } catch (err) {
      console.error('Error updating transaction:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update transaction';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transaction) => {
    try {
      // Show confirmation dialog
      const confirmed = window.confirm('Are you sure you want to delete this transaction?');
      if (!confirmed) {
        return;
      }

      setLoading(true);
      console.log('Deleting transaction:', transaction);
      const result = await deleteTransaction(transaction._id);
      
      if (result && result.message === 'Transaction deleted successfully') {
        toast.success('Transaction deleted successfully');
        
        // Refresh both transactions and dashboard data
        await Promise.all([
          getTransactions(),
          getTransactionSummary()
        ]);
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete transaction';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const preventScroll = (e) => {
    e.target.blur();
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food': 'bg-orange-500',
      'Transport': 'bg-blue-500',
      'Utilities': 'bg-yellow-500',
      'Housing': 'bg-purple-500',
      'Entertainment': 'bg-pink-500',
      'Shopping': 'bg-green-500',
      'Healthcare': 'bg-red-500',
      'Education': 'bg-indigo-500',
      'Other': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  // Get category name and icon
  const getCategoryInfo = (categoryId, type) => {
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const category = categories.find(c => c.id === categoryId);
    return {
      name: category?.name || 'Other',
      icon: CATEGORY_ICONS[categoryId] || CATEGORY_ICONS.other,
      color: CATEGORY_COLORS[categoryId] || CATEGORY_COLORS.other
    };
  };

  // Handle budget setting
  const handleSetBudget = (category) => {
    setSelectedBudgetCategory(category);
    setBudgetAmount(categoryBudgets[category.id] || '');
    setShowBudgetModal(true);
  };

  const handleSaveBudget = () => {
    if (selectedBudgetCategory && budgetAmount) {
      const amount = parseFloat(budgetAmount);
      if (isNaN(amount) || amount < 0) {
        toast.error('Please enter a valid budget amount');
        return;
      }

      // Save budget to localStorage
      localStorage.setItem(`budget_${selectedBudgetCategory.id}`, amount.toString());
      setCategoryBudgets(prev => ({
        ...prev,
        [selectedBudgetCategory.id]: amount
      }));
      toast.success(`Budget set for ${selectedBudgetCategory.name}`);
      setShowBudgetModal(false);
    }
  };

  // Calculate budget progress
  const getBudgetProgress = (category) => {
    const budget = parseFloat(categoryBudgets[category.id]) || 0;
    const spent = categoryTotals[category.id] || 0;
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  // Get budget status color
  const getBudgetStatusColor = (category) => {
    const progress = getBudgetProgress(category);
    if (progress >= 100) return 'bg-red-500';
    if (progress >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Update the amount input to show the correct currency symbol
  const renderAmountInput = (value, onChange, name = 'amount') => (
    <div className="relative">
      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
        {selectedCurrency}
      </span>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        required
        min="0"
        step="0.01"
        className="w-full pl-8 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="0.00"
      />
    </div>
  );

  if (loading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || contextError) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error || contextError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Filters and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-gray-400">
                Search by title, category, description, or payment method
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[180px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {(formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Sort Filter */}
          <div className="relative min-w-[180px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 appearance-none cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Add Transaction Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Add Transaction
        </button>
      </div>

      {/* Category Overview Section - Responsive */}
      {/* Grid for sm and up */}
      <div className="mb-6 hidden sm:block">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Category Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {EXPENSE_CATEGORIES.map(category => (
            <div key={category.id} className="bg-gray-800 rounded-lg p-3 sm:p-4 shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon 
                    icon={CATEGORY_ICONS[category.id]} 
                    className={`${CATEGORY_COLORS[category.id]} p-2 rounded-lg text-sm sm:text-base`}
                  />
                  <div>
                    <h3 className="text-white font-medium text-sm sm:text-base">{category.name}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Spent: {formatAmount(categoryTotals[category.id] || 0)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSetBudget(category)}
                  className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
                >
                  Set Budget
                </button>
              </div>
              {/* Budget Progress Bar */}
              {categoryBudgets[category.id] > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-gray-400">
                      Budget: {formatAmount(categoryBudgets[category.id])}
                    </span>
                    <span className="text-gray-400">
                      {Math.round(getBudgetProgress(category))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`${getBudgetStatusColor(category)} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${getBudgetProgress(category)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Card list for mobile only */}
      <div className="mb-6 sm:hidden flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white mb-3">Category Overview</h2>
        {EXPENSE_CATEGORIES.map(category => (
          <div key={category.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <div className={`${CATEGORY_COLORS[category.id]} rounded-full w-10 h-10 flex items-center justify-center shadow-md`}>
                <FontAwesomeIcon icon={CATEGORY_ICONS[category.id]} className="text-white text-lg" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-base leading-tight">{category.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">Spent: <span className="font-semibold text-gray-200">{formatAmount(categoryTotals[category.id] || 0)}</span></div>
              </div>
            </div>
            {categoryBudgets[category.id] > 0 && (
              <div className="mt-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Budget: <span className="font-semibold text-gray-200">{formatAmount(categoryBudgets[category.id])}</span></span>
                  <span className="text-gray-400">{Math.round(getBudgetProgress(category))}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`${getBudgetStatusColor(category)} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${getBudgetProgress(category)}%` }}
                  />
                </div>
              </div>
            )}
            <button
              onClick={() => handleSetBudget(category)}
              className="mt-3 w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow hover:bg-blue-700 transition-colors"
            >
              Set Budget
            </button>
          </div>
        ))}
      </div>
      {/* Transactions Heading */}
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Transactions</h2>

      {/* Transactions Table - Table for sm+ screens, Card list for mobile */}
      {/* Table layout for sm and above */}
      <div className="bg-gray-800 rounded-xl overflow-hidden sm:block hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="bg-gray-700 text-gray-300">
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-400 text-sm">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(transaction => {
                  const { name: categoryName, icon: categoryIcon, color: categoryColor } = 
                    getCategoryInfo(transaction.category, transaction.type);
                  return (
                    <motion.tr
                      key={transaction.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-300 hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className={`${categoryColor} p-1.5 rounded`}>
                            <FontAwesomeIcon 
                              icon={categoryIcon}
                              className="text-white text-sm" 
                            />
                          </div>
                          <span>{categoryName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{transaction.description || 'No description'}</td>
                      <td className={`px-4 py-3 font-medium ${
                        transaction.type === 'expense' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <FontAwesomeIcon 
                            icon={PAYMENT_METHODS.find(m => m.id === transaction.paymentMethod)?.icon || faMoneyBill} 
                            className="text-gray-400 text-sm" 
                          />
                          <span className="text-gray-400">
                            {PAYMENT_METHODS.find(m => m.id === transaction.paymentMethod)?.label || 'Cash'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <FontAwesomeIcon icon={faEdit} className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Card list layout for mobile only */}
      <div className="sm:hidden flex flex-col gap-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400 text-sm">
            No transactions found
          </div>
        ) : (
          filteredTransactions.map(transaction => {
            const { name: categoryName, icon: categoryIcon, color: categoryColor } = getCategoryInfo(transaction.category, transaction.type);
            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800 rounded-lg p-3 flex flex-col gap-2 shadow"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`${categoryColor} p-2 rounded`}>
                    <FontAwesomeIcon icon={categoryIcon} className="text-white text-base" />
                  </div>
                  <span className="font-medium text-white text-sm">{categoryName}</span>
                  <span className={`ml-auto font-semibold ${transaction.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>{transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)}</span>
                </div>
                <div className="text-gray-300 text-xs">{transaction.description || 'No description'}</div>
                <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                  <span>{new Date(transaction.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={PAYMENT_METHODS.find(m => m.id === transaction.paymentMethod)?.icon || faMoneyBill} className="text-gray-400 text-xs" />
                    {PAYMENT_METHODS.find(m => m.id === transaction.paymentMethod)?.label || 'Cash'}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="flex-1 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(transaction)}
                    className="flex-1 py-1 rounded bg-gray-700 text-red-400 hover:bg-gray-600 text-xs"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Add Transaction</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Transaction Type */}
                <div className="flex space-x-4">
                    <button
                      type="button"
                    onClick={() => handleInputChange({ target: { name: 'type', value: 'expense' } })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                        formData.type === 'expense'
                          ? 'border-red-500 bg-red-500 bg-opacity-20 text-red-400'
                          : 'border-gray-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                    Expense
                    </button>
                    <button
                      type="button"
                    onClick={() => handleInputChange({ target: { name: 'type', value: 'income' } })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                        formData.type === 'income'
                          ? 'border-green-500 bg-green-500 bg-opacity-20 text-green-400'
                          : 'border-gray-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                    Income
                    </button>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCategorySelect(!showCategorySelect)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-left flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {formData.category && (
                          <FontAwesomeIcon
                            icon={CATEGORY_ICONS[formData.category]}
                            className={`${CATEGORY_COLORS[formData.category]} p-1 rounded`}
                          />
                        )}
                      <span>
                        {formData.category
                          ? (formData.type === 'expense'
                              ? EXPENSE_CATEGORIES.find(c => c.id === formData.category)?.name
                              : INCOME_CATEGORIES.find(c => c.id === formData.category)?.name)
                          : 'Select Category'}
                      </span>
                      </div>
                      <FontAwesomeIcon icon={faChevronDown} />
                    </button>

                    {showCategorySelect && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
                        {(formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(category => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              handleInputChange({ target: { name: 'category', value: category.id } });
                              setShowCategorySelect(false);
                            }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 flex items-center space-x-2"
                          >
                            <FontAwesomeIcon
                              icon={CATEGORY_ICONS[category.id]}
                              className={`${CATEGORY_COLORS[category.id]} p-1 rounded`}
                            />
                            <span>{category.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Amount
                  </label>
                  {renderAmountInput(formData.amount, handleInputChange)}
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
                    onChange={handleInputChange}
                    max={getMaxDate()}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter transaction description"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    maxLength={50}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {formData.description.length}/50 characters
              </div>
            </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Payment Method
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPaymentSelect(!showPaymentSelect)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-left flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {formData.paymentMethod && (
                          <FontAwesomeIcon
                            icon={PAYMENT_METHODS.find(m => m.id === formData.paymentMethod)?.icon}
                            className="text-blue-400 p-1 rounded"
                          />
                        )}
                        <span>
                          {formData.paymentMethod
                            ? PAYMENT_METHODS.find(m => m.id === formData.paymentMethod)?.label
                            : 'Select Payment Method'}
                        </span>
                      </div>
                      <FontAwesomeIcon icon={faChevronDown} />
                    </button>

                    {showPaymentSelect && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
                    {PAYMENT_METHODS.map(method => (
                      <button
                        key={method.id}
                        type="button"
                            onClick={() => {
                              handleInputChange({ target: { name: 'paymentMethod', value: method.id } });
                              setShowPaymentSelect(false);
                            }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 flex items-center space-x-2"
                      >
                        <FontAwesomeIcon 
                          icon={method.icon} 
                              className="text-blue-400 p-1 rounded"
                        />
                            <span>{method.label}</span>
                      </button>
          ))}
                      </div>
                    )}
        </div>
      </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Add Transaction
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Transaction Modal */}
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Edit Transaction</h2>
                <button
                onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

            <form onSubmit={handleUpdate} className="space-y-4">
                {/* Transaction Type */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                  onClick={() => handleInputChange({ target: { name: 'type', value: 'expense' } })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      formData.type === 'expense'
                        ? 'border-red-500 bg-red-500 bg-opacity-20 text-red-400'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                  onClick={() => handleInputChange({ target: { name: 'type', value: 'income' } })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      formData.type === 'income'
                        ? 'border-green-500 bg-green-500 bg-opacity-20 text-green-400'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    Income
                  </button>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                  onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Enter description"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Amount
                  </label>
                  {renderAmountInput(formData.amount, handleInputChange)}
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCategorySelect(!showCategorySelect)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-left flex items-center justify-between"
                    >
                    <div className="flex items-center space-x-2">
                      {formData.category && (
                        <FontAwesomeIcon
                          icon={CATEGORY_ICONS[formData.category]}
                          className={`${CATEGORY_COLORS[formData.category]} p-1 rounded`}
                        />
                      )}
                      <span>
                        {formData.category
                          ? (formData.type === 'expense'
                              ? EXPENSE_CATEGORIES.find(c => c.id === formData.category)?.name
                              : INCOME_CATEGORIES.find(c => c.id === formData.category)?.name)
                          : 'Select Category'}
                      </span>
                    </div>
                      <FontAwesomeIcon icon={faChevronDown} />
                    </button>

                      {showCategorySelect && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
                        {(formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(category => (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => {
                            handleInputChange({ target: { name: 'category', value: category.id } });
                                  setShowCategorySelect(false);
                                }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 flex items-center space-x-2"
                          >
                            <FontAwesomeIcon
                              icon={CATEGORY_ICONS[category.id]}
                            className={`${CATEGORY_COLORS[category.id]} p-1 rounded`}
                            />
                            <span>{category.name}</span>
                              </button>
                            ))}
                          </div>
                      )}
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
                  onChange={handleInputChange}
                  max={getMaxDate()}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                    />
                  </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Payment Method
                  </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPaymentSelect(!showPaymentSelect)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-left flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      {formData.paymentMethod && (
                        <FontAwesomeIcon
                          icon={PAYMENT_METHODS.find(m => m.id === formData.paymentMethod)?.icon}
                          className="text-blue-400 p-1 rounded"
                        />
                      )}
                      <span>
                        {formData.paymentMethod
                          ? PAYMENT_METHODS.find(m => m.id === formData.paymentMethod)?.label
                          : 'Select Payment Method'}
                      </span>
                    </div>
                    <FontAwesomeIcon icon={faChevronDown} />
                  </button>

                  {showPaymentSelect && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
                    {PAYMENT_METHODS.map(method => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            handleInputChange({ target: { name: 'paymentMethod', value: method.id } });
                            setShowPaymentSelect(false);
                          }}
                          className="w-full px-4 py-2 text-left text-white hover:bg-gray-600 flex items-center space-x-2"
                        >
                          <FontAwesomeIcon
                            icon={method.icon}
                            className="text-blue-400 p-1 rounded"
                          />
                          <span>{method.label}</span>
                        </button>
                    ))}
                    </div>
                  )}
                </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading}
                >
                {loading ? 'Updating...' : 'Update Transaction'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

      {/* Budget Modal */}
      <AnimatePresence>
        {showBudgetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Set Budget for {selectedBudgetCategory?.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Budget Amount
                  </label>
                  <input
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Enter budget amount"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleSaveBudget}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Budget
                  </button>
                  <button
                    onClick={() => setShowBudgetModal(false)}
                    className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Add Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <FontAwesomeIcon icon={faPlus} className="text-xl" />
      </motion.button>
    </div>
  );
};

export default Expenses; 
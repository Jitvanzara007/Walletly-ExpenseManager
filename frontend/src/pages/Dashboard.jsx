import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet, faChartLine, faCalendarAlt, faArrowUp, faArrowDown,
  faUtensils, faCar, faHome, faBolt, faFilm, faShoppingCart,
  faHeartbeat, faGraduationCap, faMoneyBill, faBriefcase, faGift, faPlane,
  faDollarSign, faPercent, faChartBar, faChartPie, faChartArea
} from '@fortawesome/free-solid-svg-icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { FaWallet as FaWalletIcon, FaExchangeAlt, FaCalendarAlt } from 'react-icons/fa';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register ChartJS components and the datalabels plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  ChartDataLabels
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { getTransactionSummary } = useExpense();
  const { formatAmount, selectedCurrency } = useCurrency();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expenses: 0,
    balance: 0,
    category_totals: {},
    recent_transactions: []
  });
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      const data = await getTransactionSummary();
      console.log('Dashboard data received:', data);
      
      if (data) {
        setSummary({
          total_income: data.total_income || 0,
          total_expenses: data.total_expenses || 0,
          balance: data.balance || 0,
          category_totals: data.category_totals || {},
          recent_transactions: data.recent_transactions || []
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleForceReset = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Sending force reset request...');
      const response = await fetch('http://localhost:5000/api/expenses/force-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Force reset response status:', response.status);
      const data = await response.json();
      console.log('Force reset response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset transactions');
      }

      // Update summary with the new totals
      setSummary(prev => ({
        ...prev,
        total_income: data.totals.income,
        total_expenses: data.totals.expenses,
        balance: data.totals.balance,
        recent_transactions: data.transactions
      }));

      // Show success message
      setError('');
    } catch (err) {
      console.error('Error resetting transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts and when user changes
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  // Set up polling to refresh dashboard data every 30 seconds
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [user]);

  // Update amounts when currency changes
  useEffect(() => {
    const handleCurrencyChange = () => {
      // Force re-render of components that display amounts
      setRefreshTrigger(prev => !prev);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  const getCategoryIcon = (category) => {
    const iconMap = {
      'food': faUtensils,
      'transport': faCar,
      'housing': faHome,
      'utilities': faBolt,
      'entertainment': faFilm,
      'shopping': faShoppingCart,
      'healthcare': faHeartbeat,
      'education': faGraduationCap,
      'salary': faMoneyBill,
      'business': faBriefcase,
      'gifts': faGift,
      'travel': faPlane
    };
    return iconMap[category] || faWallet; // Default icon
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'food': '#FF6384', // Pink
      'transport': '#36A2EB', // Blue
      'housing': '#FFCE56', // Yellow
      'utilities': '#4BC0C0', // Teal
      'entertainment': '#9966FF', // Purple
      'shopping': '#FF9F40', // Orange
      'healthcare': '#EF4444', // Red
      'education': '#6366F1', // Indigo
      'salary': '#10B981', // Green
      'business': '#F59E0B', // Amber
      'gifts': '#EC4899', // Pink-ish
      'travel': '#3B82F6' // Blue-ish
    };
    return colorMap[category] || '#6B7280';
  };

  // Update the doughnut chart data with better colors
  const doughnutChartData = {
    labels: summary.category_totals ? Object.keys(summary.category_totals) : [],
    datasets: [{
      data: summary.category_totals ? Object.values(summary.category_totals) : [],
      backgroundColor: [
        '#FF6384', // Food - Pink
        '#36A2EB', // Transport - Blue
        '#FFCE56', // Housing - Yellow
        '#4BC0C0', // Utilities - Teal
        '#9966FF', // Entertainment - Purple
        '#FF9F40', // Shopping - Orange
        '#EF4444'  // Healthcare - Red
      ],
      borderColor: '#1F2937',
      borderWidth: 3,
      hoverOffset: 15,
      hoverBorderWidth: 4,
      borderRadius: 5,
      spacing: 2
    }]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%', // Adjust cutout for better segment size
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          color: '#ffffff',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 25,
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map(function(label, i) {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                 const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor,
                  lineWidth: 2,
                  hidden: isNaN(data.datasets[0].data[i]),
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        enabled: false,
      },
      datalabels: {
        display: true,
        color: 'white',
        textAlign: 'center',
        textBaseline: 'middle',
        font: {
          weight: 'bold',
          size: 16
        },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return percentage >= 5 ? `${percentage}%` : '';
        },
        anchor: 'center',
        align: 'center'
      }
    },
     animation: {
       animateScale: true,
       animateRotate: true,
       duration: 1000,
       easing: 'easeInOutQuart'
     },
     hover: {
       mode: 'nearest',
       intersect: true,
       animationDuration: 400,
        onHover: function(event, chartElement) {
           event.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
        }
     }
  };

  // Update the line chart data and options
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [5000, 5500, 6000, 6500, 7000, 7500], // Example data
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
         pointBackgroundColor: '#10B981',
         pointBorderColor: '#fff',
         pointHoverBackgroundColor: '#fff',
         pointHoverBorderColor: '#10B981',
      },
      {
        label: 'Expenses',
        data: [3000, 3200, 3500, 3300, 3600, 3800], // Example data
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
         pointBackgroundColor: '#EF4444',
         pointBorderColor: '#fff',
         pointHoverBackgroundColor: '#fff',
         pointHoverBorderColor: '#EF4444',
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 15,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatAmount(context.raw)}`;
          }
        }
      },
      datalabels: {
         display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: '#9CA3AF',
          callback: (value) => formatAmount(value)
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9CA3AF'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 text-white">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p>{error}</p>
              <button 
                onClick={() => navigate('/login')}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome back, {user?.username || 'User'}!</h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">Here's your financial overview</p>
          </motion.div>

          {/* Summary Cards Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 mb-4 sm:mb-6">
            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg p-4 sm:p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-white">Total Balance</h3>
                <FontAwesomeIcon icon={faWallet} className="text-white text-base sm:text-lg" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{formatAmount(summary.balance)}</p>
              <div className="flex space-x-4">
                <div>
                  <p className="text-xs text-indigo-200">Income</p>
                  <p className="text-sm font-semibold text-white">{formatAmount(summary.total_income)}</p>
                </div>
                <div>
                  <p className="text-xs text-indigo-200">Expenses</p>
                  <p className="text-sm font-semibold text-white">{formatAmount(summary.total_expenses)}</p>
                </div>
              </div>
            </motion.div>

            {/* Income Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4 sm:p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-white">Total Income</h3>
                <FontAwesomeIcon icon={faArrowUp} className="text-white text-base sm:text-lg" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{formatAmount(summary.total_income)}</p>
              <div className="flex items-center text-green-200 text-xs sm:text-sm">
                <FontAwesomeIcon icon={faPercent} className="mr-2" />
                <span>+12% from last month</span>
              </div>
            </motion.div>

            {/* Expenses Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-4 sm:p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-white">Total Expenses</h3>
                <FontAwesomeIcon icon={faArrowDown} className="text-white text-base sm:text-lg" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{formatAmount(summary.total_expenses)}</p>
              <div className="flex items-center text-red-200 text-xs sm:text-sm">
                <FontAwesomeIcon icon={faPercent} className="mr-2" />
                <span>-5% from last month</span>
              </div>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-4 sm:mb-6">
            {/* Income vs Expenses Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-3 sm:p-6"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">Income vs Expenses</h3>
                <FontAwesomeIcon icon={faChartLine} className="text-gray-400" />
              </div>
              <div style={{ height: '220px', width: '100%', position: 'relative' }} className="sm:h-[300px]">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-3 sm:p-6"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">Category Breakdown</h3>
                <FontAwesomeIcon icon={faChartPie} className="text-gray-400" />
              </div>
              <div style={{ height: '220px', width: '100%', position: 'relative' }} className="sm:h-[300px]">
                {summary.category_totals && Object.keys(summary.category_totals).length > 0 ? (
                  <Doughnut 
                    data={doughnutChartData} 
                    options={doughnutChartOptions}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No category data available
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent Transactions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-3 sm:p-6 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4 gap-2 sm:gap-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-200">Recent Transactions</h3>
              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
            </div>
            <div className="space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}>
              <AnimatePresence>
                {summary.recent_transactions && summary.recent_transactions.length > 0 ? (
                  summary.recent_transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction._id || transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                          } bg-opacity-20`}
                        >
                          <FontAwesomeIcon
                            icon={getCategoryIcon(transaction.category)}
                            className={`text-base sm:text-lg ${
                              transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm sm:text-base">{transaction.description}</p>
                          <p className="text-xs text-gray-400 capitalize">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm sm:text-base ${
                          transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    No recent transactions
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
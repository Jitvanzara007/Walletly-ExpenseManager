import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaSignOutAlt, 
  FaBell,
  FaShieldAlt,
  FaTrash,
  FaDownload,
  FaCog,
  FaWallet,
  FaChartLine,
  FaLanguage,
  FaPalette,
  FaCreditCard,
  FaQuestionCircle,
  FaExchangeAlt,
  FaGlobe,
  FaChevronRight,
  FaTimes,
  FaUserCircle,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaFileCsv,
  FaFilePdf,
  FaEye,
  FaEyeSlash,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useExpense } from '../context/ExpenseContext';
import { useNavigate } from 'react-router-dom';

// Available currencies with their symbols and names
const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  CHF: { symbol: 'Fr', name: 'Swiss Franc' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' }
};

const Settings = () => {
  const { user, logout, setUser } = useAuth();
  const { 
    selectedCurrency, 
    setSelectedCurrency, 
    getCurrencyName, 
    getCurrencySymbol,
    convertAmount,
    formatAmount,
    exchangeRates,
    loading: currencyLoading,
    error: currencyError,
    changeCurrency
  } = useCurrency();
  const { getTransactions, getTransactionSummary } = useExpense();
  const navigate = useNavigate();

  const [profileLoading, setProfileLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [emailToUpdate, setEmailToUpdate] = useState('');
  const [editProfileData, setEditProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || ''
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPasswordUpdateModal, setShowPasswordUpdateModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [mobileActiveTab, setMobileActiveTab] = useState(null);

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
    toast.success(`Currency changed to ${getCurrencyName()}`);
  };

  const handleLogout = async () => {
    setProfileLoading(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setError('');

    try {
      // Update name and username
      const updateData = {
        name: editProfileData.name,
        username: editProfileData.username
      };

      const response = await axios.put('http://localhost:5000/api/auth/profile', updateData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      // Update the user state with the new data
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      
      toast.success('Profile updated successfully');
      setShowEditProfileModal(false);
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleEmailChange = async (newEmail) => {
    setEmailToUpdate(newEmail);
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async () => {
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setProfileLoading(true);
    try {
      const response = await axios.put('http://localhost:5000/api/auth/email', {
        email: emailToUpdate,
        password: password
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      // Update the user state with the new email
      const updatedUser = { ...user, email: emailToUpdate };
      setUser(updatedUser);
      
      toast.success('Email updated successfully');
      setEditProfileData(prev => ({ ...prev, email: emailToUpdate }));
      setShowPasswordModal(false);
      setPassword('');
    } catch (err) {
      console.error('Email update error:', err);
      const errorMessage = err.response?.data?.message || 'Invalid password or failed to update email';
      toast.error(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (profileLoading) return;

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
    }

    if (passwordData.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters long');
        return;
    }

    setProfileLoading(true);
    try {
        // Get token and verify it exists
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found in localStorage');
            toast.error('Authentication error. Please log in again.');
            navigate('/login');
            return;
        }

        console.log('Starting password update process...');
        console.log('Current user from context:', user);
        
        // First verify the current user
        try {
            console.log('Verifying current user...');
            const currentUser = await axios.get('http://localhost:5000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Current user verification response:', {
                status: currentUser.status,
                data: currentUser.data,
                userId: currentUser.data?._id
            });

            if (!currentUser.data) {
                throw new Error('No user data returned from verification');
            }
        } catch (verifyError) {
            console.error('User verification failed:', {
                status: verifyError.response?.status,
                message: verifyError.response?.data?.message,
                error: verifyError.message
            });
            
            if (verifyError.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
                navigate('/login');
            } else {
                toast.error('Failed to verify user. Please try again.');
            }
            return;
        }

        // Proceed with password update
        console.log('Proceeding with password update...');
        const response = await axios.put('http://localhost:5000/api/auth/password', {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Password update response:', {
            status: response.status,
            message: response.data.message
        });

        toast.success('Password updated successfully');
        setShowPasswordUpdateModal(false);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    } catch (err) {
        console.error('Password update error:', {
            status: err.response?.status,
            message: err.response?.data?.message,
            error: err.message,
            data: err.response?.data
        });
        
        if (err.response?.status === 401) {
            toast.error('Session expired. Please log in again.');
            navigate('/login');
        } else if (err.response?.status === 404) {
            // Check if the error is about user not found
            if (err.response?.data?.message === 'User not found') {
                console.error('User not found error. Current user:', user);
                toast.error('Account not found. Please log in again.');
                navigate('/login');
            } else {
                toast.error(err.response?.data?.message || 'Failed to update password');
            }
        } else if (err.response?.status === 400) {
            // Handle incorrect current password
            if (err.response?.data?.message === 'Current password is incorrect') {
                toast.error('Current password is incorrect');
            } else {
                toast.error(err.response?.data?.message || 'Invalid password format');
            }
        } else {
            toast.error(err.response?.data?.message || 'Failed to update password');
        }
    } finally {
        setProfileLoading(false);
    }
  };

  // Helper function to format amount with proper currency conversion
  const formatAmountForPDF = (amount) => {
    // Convert amount to selected currency
    const convertedAmount = convertAmount(amount);
    
    // Format the number with 2 decimal places
    const formattedNumber = convertedAmount.toFixed(2);
    
    // Add thousand separators
    const parts = formattedNumber.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formattedAmount = parts.join('.');
    
    // Add currency symbol
    const symbol = selectedCurrency === 'INR' ? '₹' : 
                  selectedCurrency === 'USD' ? '$' :
                  selectedCurrency === 'EUR' ? '€' :
                  selectedCurrency === 'GBP' ? '£' : '';
    
    return symbol + formattedAmount;
  };

  // Helper function to format date consistently
  const formatDateForPDF = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  };

  const generatePDF = async (data) => {
    try {
      console.log('Starting PDF generation with data:', data);
      console.log('Selected currency:', selectedCurrency);
      
      // Create new PDF document
      const doc = new jsPDF();
      console.log('PDF document created');

      // Basic document info
      doc.setProperties({
        title: 'Account Report',
        subject: 'Transaction History',
        author: user?.name || 'User',
        creator: 'Crypto App'
      });

      // Calculate totals with proper currency conversion
      const totals = data.reduce((acc, t) => {
        const convertedAmount = convertAmount(t.amount);
        if (t.type === 'income' || t.type === 'investment') {
          acc.income += convertedAmount;
        } else {
          acc.expenses += convertedAmount;
        }
        return acc;
      }, { income: 0, expenses: 0 });
      
      totals.balance = totals.income - totals.expenses;

      // Simple header
      doc.setFontSize(16);
      doc.text('Account Report', 20, 20);
      
      // Basic info
      doc.setFontSize(12);
      doc.text(`Generated: ${formatDateForPDF(new Date())}`, 20, 30);
      doc.text(`Currency: ${selectedCurrency}`, 20, 37);

      // Add summary section
      doc.setFontSize(14);
      doc.text('Summary', 20, 47);

      // Calculate total width of transaction table
      const totalWidth = doc.internal.pageSize.width - 40; // 20px margin on each side
      
      // Define column widths as percentages of total width
      const columnWidths = {
        date: totalWidth * 0.15,    // 15% of total width
        type: totalWidth * 0.15,    // 15% of total width
        description: totalWidth * 0.25, // 25% of total width
        category: totalWidth * 0.15,   // 15% of total width
        amount: totalWidth * 0.30     // 30% of total width - increased for amounts
      };

      // Calculate summary table widths to match transaction table
      const summaryWidths = {
        category: columnWidths.date + columnWidths.type + columnWidths.description + columnWidths.category,
        amount: columnWidths.amount
      };

      // Format summary amounts
      const summaryAmounts = {
        income: formatAmountForPDF(totals.income),
        expenses: formatAmountForPDF(totals.expenses),
        balance: formatAmountForPDF(totals.balance)
      };

      // Add summary table with matching widths
      autoTable(doc, {
        startY: 50,
        head: [['Category', 'Amount']],
        body: [
          ['Total Income', summaryAmounts.income],
          ['Total Expenses', summaryAmounts.expenses],
          ['Balance', summaryAmounts.balance]
        ],
        theme: 'grid',
        styles: { 
          fontSize: 10,
          cellPadding: 5,
          textColor: [0, 0, 0],
          overflow: 'linebreak',
          halign: 'left'
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { 
            cellWidth: summaryWidths.category,
            halign: 'left'
          },
          1: { 
            cellWidth: summaryWidths.amount,
            halign: 'right',
            overflow: 'linebreak'
          }
        },
        margin: { top: 50, left: 20, right: 20 }
      });

      // Format transactions for the table
      const tableData = data.map(t => {
        const convertedAmount = convertAmount(t.amount);
        const type = t.type === 'investment' ? 'Investment' : 
                    t.type === 'income' ? 'Income' : 'Expense';
        
        // Format amount with sign
        let formattedAmount = formatAmountForPDF(convertedAmount);
        if (t.type === 'income' || t.type === 'investment') {
          formattedAmount = '+' + formattedAmount;
        } else {
          formattedAmount = '-' + formattedAmount;
        }
        
        return [
          formatDateForPDF(t.date),
          type,
          t.description || 'No description',
          t.category || 'General',
          formattedAmount
        ];
      });

      // Add transactions section
      doc.setFontSize(14);
      doc.text('Transactions', 20, doc.lastAutoTable.finalY + 15);

      // Create transactions table with consistent widths
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Date', 'Type', 'Description', 'Category', 'Amount']],
        body: tableData,
        theme: 'grid',
        styles: { 
          fontSize: 10,
          cellPadding: 5,
          textColor: [0, 0, 0],
          overflow: 'linebreak',
          halign: 'left'
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: columnWidths.date, halign: 'center' }, // Date
          1: { cellWidth: columnWidths.type, halign: 'center' }, // Type
          2: { cellWidth: columnWidths.description }, // Description
          3: { cellWidth: columnWidths.category, halign: 'center' }, // Category
          4: { 
            cellWidth: columnWidths.amount, 
            halign: 'right',
            overflow: 'linebreak'
          } // Amount
        },
        margin: { top: doc.lastAutoTable.finalY + 20, left: 20, right: 20 }
      });

      // Add footer with page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      console.log('Table created, saving PDF...');

      // Save the PDF
      const fileName = `account_report_${selectedCurrency}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      console.log('PDF saved successfully as:', fileName);
      
      return true;
    } catch (error) {
      console.error('Detailed PDF generation error:', error);
      if (error.message) console.error('Error message:', error.message);
      if (error.stack) console.error('Error stack:', error.stack);
      return false;
    }
  };

  const generateCSV = (data) => {
    try {
      // Create CSV content with proper escaping
      const headers = ['Date', 'Type', 'Description', 'Category', 'Amount', 'Payment Method', 'Status'];
      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...data.map(row => [
          `"${new Date(row.date).toLocaleDateString()}"`,
          `"${row.type === 'income' ? 'Income' : 'Expense'}"`,
          `"${(row.description || 'No description').replace(/"/g, '""')}"`,
          `"${row.category}"`,
          `"${row.amount}"`,
          `"${row.paymentMethod || 'Cash'}"`,
          `"${row.status || 'Completed'}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `account_data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('CSV generation error:', error);
      return false;
    }
  };

  const handleExportData = async (format) => {
    if (exportLoading) return;
    
    setExportLoading(true);
    let errorMessage = '';

    try {
      console.log('Starting export process for format:', format);
      
      // Get actual transaction data
      const transactions = await getTransactions();
      console.log('Retrieved transactions:', transactions);
      
      if (!transactions || transactions.length === 0) {
        throw new Error('No transaction data available to export');
      }

      let success = false;
      if (format === 'csv') {
        success = generateCSV(transactions);
        if (!success) errorMessage = 'Failed to generate CSV file';
      } else if (format === 'pdf') {
        console.log('Attempting to generate PDF...');
        success = await generatePDF(transactions);
        if (!success) {
          errorMessage = 'Failed to generate PDF file. Please check console for details.';
          console.error('PDF generation failed');
        }
      }

      if (success) {
        toast.success(`Account data exported as ${format.toUpperCase()}`);
      } else {
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Export process error:', error);
      toast.error(error.message || 'Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
      if (!errorMessage) {
        setShowExportModal(false);
      }
    }
  };

  const handleThemeChange = (newTheme) => {
    // Update theme in localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update theme state
    setTheme(newTheme);
    
    // Update document classes
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.className = 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900';
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-gray-50';
    }

    // Update main container
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      if (newTheme === 'dark') {
        mainContainer.classList.remove('bg-gray-50');
        mainContainer.classList.add('bg-gradient-to-br', 'from-gray-900', 'via-purple-900', 'to-gray-900');
      } else {
        mainContainer.classList.remove('bg-gradient-to-br', 'from-gray-900', 'via-purple-900', 'to-gray-900');
        mainContainer.classList.add('bg-gray-50');
      }
    }

    // Update all text colors
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, a').forEach(el => {
      if (newTheme === 'dark') {
        el.classList.remove('text-gray-900', 'text-gray-800', 'text-gray-700');
        el.classList.add('text-white');
      } else {
        el.classList.remove('text-white');
        el.classList.add('text-gray-900');
      }
    });

    // Update all backgrounds
    document.querySelectorAll('.bg-gray-800, .bg-gray-900, .bg-white, .bg-gray-50').forEach(el => {
      if (newTheme === 'dark') {
        el.classList.remove('bg-white', 'bg-gray-50');
        el.classList.add('bg-gray-800');
      } else {
        el.classList.remove('bg-gray-800', 'bg-gray-900');
        el.classList.add('bg-white');
      }
    });

    // Update all cards and containers
    document.querySelectorAll('.card, .container, .rounded-lg, .p-4, .p-6').forEach(el => {
      if (newTheme === 'dark') {
        el.classList.remove('bg-white', 'bg-gray-50');
        el.classList.add('bg-gray-800');
      } else {
        el.classList.remove('bg-gray-800', 'bg-gray-900');
        el.classList.add('bg-white');
      }
    });

    // Update navbar
    const navbar = document.querySelector('nav');
    if (navbar) {
      if (newTheme === 'dark') {
        navbar.classList.remove('bg-white', 'bg-gray-50');
        navbar.classList.add('bg-gray-800');
      } else {
        navbar.classList.remove('bg-gray-800', 'bg-gray-900');
        navbar.classList.add('bg-white');
      }
    }

    // Update all borders
    document.querySelectorAll('.border-gray-700, .border-gray-200').forEach(el => {
      if (newTheme === 'dark') {
        el.classList.remove('border-gray-200');
        el.classList.add('border-gray-700');
      } else {
        el.classList.remove('border-gray-700');
        el.classList.add('border-gray-200');
      }
    });

    // Update all shadows
    document.querySelectorAll('.shadow-lg, .shadow-md').forEach(el => {
      if (newTheme === 'dark') {
        el.classList.remove('shadow-gray-200');
        el.classList.add('shadow-gray-900');
      } else {
        el.classList.remove('shadow-gray-900');
        el.classList.add('shadow-gray-200');
      }
    });

    // Update all hover states
    document.querySelectorAll('button, a, .hover\\:bg-gray-700, .hover\\:bg-gray-100').forEach(el => {
      if (newTheme === 'dark') {
        el.classList.remove('hover:bg-gray-100');
        el.classList.add('hover:bg-gray-700');
      } else {
        el.classList.remove('hover:bg-gray-700');
        el.classList.add('hover:bg-gray-100');
      }
    });

    // Update all charts and graphs
    document.querySelectorAll('.recharts-wrapper, .chart-container').forEach(el => {
      if (newTheme === 'dark') {
        el.classList.remove('text-gray-900');
        el.classList.add('text-white');
      } else {
        el.classList.remove('text-white');
        el.classList.add('text-gray-900');
      }
    });

    // Force a reflow to ensure changes are applied
    void document.body.offsetHeight;

    // Show success message
    toast.success(`${newTheme === 'dark' ? 'Dark' : 'Light'} theme activated`);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser, color: 'from-blue-500 to-blue-600' },
    { id: 'currency', label: 'Currency', icon: FaExchangeAlt, color: 'from-green-500 to-green-600' },
    { id: 'security', label: 'Security', icon: FaShieldAlt, color: 'from-purple-500 to-purple-600' },
    { id: 'theme', label: 'Theme', icon: FaPalette, color: 'from-yellow-500 to-yellow-600' },
    { id: 'notifications', label: 'Notifications', icon: FaBell, color: 'from-red-500 to-red-600' }
  ];

  const renderContent = (tabOverride) => {
    const tab = tabOverride || activeTab;
    switch (tab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-lg border-2 border-white/20">
                      {user?.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                      <FaUserCircle className="w-12 h-12 text-white/80" />
                      )}
                    </div>
                  </div>
                  <div>
                  <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
                  {user?.username && (
                    <p className="text-blue-100 text-sm mt-1">
                      Username: {user.username}
                    </p>
                  )}
                  <p className="text-sm text-blue-100 mt-1">{user?.email}</p>
                    </div>
                  </div>
                </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Settings */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaUser className="mr-2 text-blue-400" />
                  Account Settings
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowEditProfileModal(true)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-blue-400" />
                      <span className="text-white">Edit Profile</span>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <FaDownload className="text-blue-400" />
                      <div>
                        <span className="text-white">Download Account Data</span>
                        <p className="text-sm text-gray-400">Get your trading history and records</p>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </button>
                  <div className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaTrash className="text-red-400" />
                      <div>
                        <p className="text-sm text-gray-400">Delete Account</p>
                        <p className="text-white text-sm">Permanently delete your account and all data</p>
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaShieldAlt className="mr-2 text-blue-400" />
                  Security Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="text-green-400" />
                      <div>
                        <p className="text-sm text-gray-400">Email Verification</p>
                        <p className="text-white">Verified</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaLock className="text-yellow-400" />
                      <div>
                        <p className="text-sm text-gray-400">Two-Factor Auth</p>
                        <p className="text-white">Not Enabled</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm hover:bg-yellow-500/30 transition-all">
                      Enable
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaClock className="text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">Last Password Change</p>
                        <p className="text-white">30 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'currency':
        return (
          <div className="space-y-6">
            {/* Currency Header */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8 text-white shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Currency Settings</h2>
              <p className="text-green-100">Select your preferred currency</p>
            </div>

            {/* Currency Selection */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg">
              {currencyLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : currencyError ? (
                <div className="text-red-400 text-center py-4">{currencyError}</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                <button
                  key={code}
                      onClick={() => changeCurrency(code)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedCurrency === code
                      ? 'border-green-500 bg-green-500/10 shadow-lg'
                          : 'border-gray-700/50 bg-gray-700/50 hover:bg-gray-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{code}</p>
                      <p className="text-gray-400 text-sm">{name}</p>
                    </div>
                    <span className="text-2xl text-white">{symbol}</span>
                  </div>
                </button>
              ))}
            </div>
              )}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            {/* Security Header */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-8 text-white shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Security Settings</h2>
              <p className="text-purple-100">Manage your account security and privacy</p>
            </div>

            {/* Security Options */}
            <div className="space-y-4">
              <div 
                onClick={() => setShowPasswordUpdateModal(true)}
                className="p-4 bg-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-all"
              >
                  <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaLock className="text-blue-400 text-xl" />
                    <div>
                      <h3 className="text-white font-medium">Password</h3>
                      <p className="text-gray-400 text-sm">Update your password regularly to keep your account secure</p>
                      </div>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>

              <div className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaShieldAlt className="text-green-400 text-xl" />
                      <div>
                      <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                      <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                  <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm hover:bg-green-500/30 transition-all">
                    Enable
                    </button>
                  </div>
                </div>

              <div className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaCreditCard className="text-purple-400 text-xl" />
                    <div>
                      <h3 className="text-white font-medium">Payment Security</h3>
                      <p className="text-gray-400 text-sm">Manage your payment methods and security</p>
                    </div>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="space-y-6">
            {/* Theme Header */}
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-8 text-white shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Theme Settings</h2>
              <p className="text-yellow-100">Choose your preferred theme</p>
            </div>

            {/* Theme Toggle Card */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  {theme === 'dark' ? (
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <FaMoon className="text-yellow-400 text-2xl" />
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <FaSun className="text-yellow-500 text-2xl" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
                    </h3>
                    <p className="text-gray-400">
                      {theme === 'dark' 
                        ? 'Easier on the eyes in low light' 
                        : 'Better visibility in bright environments'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-yellow-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Theme Preview */}
              <div className="mt-6 p-4 rounded-lg bg-gray-700/30">
                <h4 className="text-white font-medium mb-4">Theme Preview</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`h-8 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                    <div className={`h-4 rounded mt-2 w-3/4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                    </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`h-8 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                    <div className={`h-4 rounded mt-2 w-3/4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                    </div>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className={`h-8 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                    <div className={`h-4 rounded mt-2 w-3/4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            {/* Notifications Header */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-8 text-white shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Notification Settings</h2>
              <p className="text-red-100">Manage how you receive updates and alerts</p>
            </div>

            {/* Notification Options */}
            <div className="space-y-4">
              {[
                {
                  icon: FaBell,
                  title: 'Email Notifications',
                  description: 'Receive updates via email',
                  color: 'red'
                },
                {
                  icon: FaChartLine,
                  title: 'Price Alerts',
                  description: 'Get notified about significant price changes',
                  color: 'blue'
                },
                {
                  icon: FaWallet,
                  title: 'Transaction Alerts',
                  description: 'Notifications for new transactions',
                  color: 'green'
                }
              ].map((item, index) => (
                <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 bg-${item.color}-500/20 rounded-lg`}>
                        <item.icon className={`text-${item.color}-400 text-xl`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        <p className="text-gray-400">{item.description}</p>
                      </div>
                    </div>
                    <div className="h-6 w-11 bg-red-500/20 rounded-full relative cursor-pointer border border-red-500/30">
                      <div className="h-4 w-4 bg-white rounded-full absolute right-1 top-1 shadow-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderPasswordModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-800/90 backdrop-blur-lg rounded-xl p-6 w-full max-w-md border border-gray-700/50"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Confirm Password</h2>
          <button
            onClick={() => {
              setShowPasswordModal(false);
              setPassword('');
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-400">
            Please enter your password to change your email to:
            <br />
            <span className="text-white font-medium">{emailToUpdate}</span>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-white/5 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={handlePasswordConfirm}
              disabled={profileLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {profileLoading ? 'Verifying...' : 'Confirm Change'}
            </button>
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPassword('');
              }}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderEditProfileModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-800/90 backdrop-blur-lg rounded-xl p-6 w-full max-w-md border border-gray-700/50"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
          <button
            onClick={() => setShowEditProfileModal(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleEditProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
            <input
              type="text"
              value={editProfileData.name}
              onChange={(e) => setEditProfileData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your full name"
              className="w-full px-4 py-2 bg-white/5 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
            <input
              type="text"
              value={editProfileData.username}
              onChange={(e) => setEditProfileData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Your username"
              className="w-full px-4 py-2 bg-white/5 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={editProfileData.email}
                onChange={(e) => setEditProfileData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Your email address"
                className="flex-1 px-4 py-2 bg-white/5 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
              {editProfileData.email !== user?.email && (
                <button
                  type="button"
                  onClick={() => handleEmailChange(editProfileData.email)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Update Email
                </button>
              )}
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={profileLoading}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                profileLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {profileLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowEditProfileModal(false)}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  const renderExportModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-800/90 backdrop-blur-lg rounded-xl p-6 w-full max-w-md border border-gray-700/50"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Export Account Data</h2>
          <button
            onClick={() => {
              setShowExportModal(false);
              setExportLoading(false);
            }}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={exportLoading}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            Choose a format to download your account data:
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => handleExportData('csv')}
              disabled={exportLoading}
              className="flex flex-col items-center justify-center p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all border border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFileCsv className="w-8 h-8 text-green-400 mb-2" />
              <span className="text-white font-medium">CSV Format</span>
              <span className="text-gray-400 text-sm">For Excel/Sheets</span>
              {exportLoading && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-400 text-sm">Generating...</span>
                </div>
              )}
            </button>
            <button
              onClick={() => handleExportData('pdf')}
              disabled={exportLoading}
              className="flex flex-col items-center justify-center p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all border border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFilePdf className="w-8 h-8 text-red-400 mb-2" />
              <span className="text-white font-medium">PDF Format</span>
              <span className="text-gray-400 text-sm">For documents</span>
              {exportLoading && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-400 text-sm">Generating...</span>
                </div>
              )}
            </button>
          </div>

          {exportLoading && (
            <p className="text-center text-gray-400 text-sm mt-4">
              Please wait while we prepare your file...
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  const renderPasswordUpdateModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-800/90 backdrop-blur-lg rounded-xl p-6 w-full max-w-md border border-gray-700/50"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Update Password</h2>
          <button
            onClick={() => {
              setShowPasswordUpdateModal(false);
              setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter your current password"
                className="w-full pl-4 pr-12 py-2 bg-white/5 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                tabIndex={-1}
              >
                {showPassword.current ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
                className="w-full pl-4 pr-12 py-2 bg-white/5 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                tabIndex={-1}
              >
                {showPassword.new ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                className="w-full pl-4 pr-12 py-2 bg-white/5 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                tabIndex={-1}
              >
                {showPassword.confirm ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={profileLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {profileLoading ? 'Updating...' : 'Update Password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPasswordUpdateModal(false);
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
              }}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4">
        {/* Sidebar and main content for md+ screens */}
        <div className="hidden md:flex flex-row gap-8 min-h-[600px]">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 shadow-lg h-full flex flex-col sticky top-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <FaCog className="mr-3 text-indigo-400" /> Settings
              </h2>
              <nav className="space-y-2 flex-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left font-medium ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="mt-8 pt-8 border-t border-gray-700/50">
              <button
                onClick={handleLogout}
                disabled={profileLoading}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
              >
                <FaSignOutAlt />
                <span>{profileLoading ? 'Logging out...' : 'Logout'}</span>
              </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
                {error}
              </div>
            )}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 shadow-lg h-full border border-gray-700/50">
              {renderContent()}
            </div>
          </div>
        </div>
        {/* Mobile layout: sidebar menu and section view */}
        <div className="flex flex-col gap-4 md:hidden">
          {/* Mobile Sidebar Menu */}
          {mobileActiveTab === null ? (
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-3 border border-gray-700/50 shadow-lg w-full">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center">
                <FaCog className="mr-2 text-indigo-400" />
                Settings
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setMobileActiveTab('profile')}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left text-gray-400 hover:bg-gray-700/50 hover:text-white"
                >
                  <FaUser className="w-5 h-5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setMobileActiveTab('currency')}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left text-gray-400 hover:bg-gray-700/50 hover:text-white"
                >
                  <FaWallet className="w-5 h-5" />
                  <span>Currency</span>
                </button>
                <button
                  onClick={() => setMobileActiveTab('theme')}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left text-gray-400 hover:bg-gray-700/50 hover:text-white"
                >
                  <FaPalette className="w-5 h-5" />
                  <span>Theme</span>
                </button>
                <button
                  onClick={() => setMobileActiveTab('notification')}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left text-gray-400 hover:bg-gray-700/50 hover:text-white"
                >
                  <FaBell className="w-5 h-5" />
                  <span>Notification</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                  <span>{profileLoading ? 'Logging out...' : 'Logout'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-3 border border-gray-700/50 shadow-lg w-full">
              <button
                onClick={() => setMobileActiveTab(null)}
                className="mb-4 flex items-center text-gray-400 hover:text-white"
              >
                <FaChevronRight className="rotate-180 mr-2" />
                Back to Settings
              </button>
              {/* Render the selected section */}
              {mobileActiveTab === 'profile' && renderContent('profile')}
              {mobileActiveTab === 'currency' && renderContent('currency')}
              {mobileActiveTab === 'theme' && renderContent('theme')}
              {mobileActiveTab === 'notification' && (
                <div className="text-white text-center py-8">Notification settings coming soon.</div>
              )}
            </div>
          )}
        </div>
        <AnimatePresence>
          {showPasswordModal && renderPasswordModal()}
          {showEditProfileModal && renderEditProfileModal()}
          {showExportModal && renderExportModal()}
          {showPasswordUpdateModal && renderPasswordUpdateModal()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Settings; 
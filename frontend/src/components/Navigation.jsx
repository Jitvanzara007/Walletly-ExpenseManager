import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaChartLine, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/onboarding');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Don't render navigation on register page
  if (location.pathname === '/register') {
    return null;
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/expenses', label: 'Expenses', icon: FaChartLine },
    { path: '/settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <nav className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo and App Name (left) */}
        <Link to={user ? "/dashboard" : "/onboarding"} className="flex items-center">
          <img
            src="/walletly.png"
            alt="Walletly Logo"
            className="h-24 w-24 sm:h-16 sm:w-16 md:h-24 md:w-24 -mr-2 sm:-mr-4"
            style={{ minWidth: 48, minHeight: 48 }}
          />
          <span className="font-extrabold text-lg sm:text-xl md:text-2xl font-sans text-gray-200 tracking-tight ml-2 sm:ml-4">
            Walletly
          </span>
        </Link>

        {/* Hamburger menu for mobile */}
        <button
          className="sm:hidden ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes className="w-6 h-6 text-gray-200" /> : <FaBars className="w-6 h-6 text-gray-200" />}
        </button>

        {/* Centered Navigation Links - Only show when logged in and not mobile */}
        {user && (
          <div className="hidden sm:flex flex-1 justify-center">
            <div className="flex space-x-6">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <FaHome className="mr-2 text-lg" /> Dashboard
              </NavLink>
              <NavLink
                to="/expenses"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <FaChartLine className="mr-2 text-lg" /> Expenses
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <FaCog className="mr-2 text-lg" /> Settings
              </NavLink>
            </div>
          </div>
        )}

        {/* Right side buttons */}
        <div className="hidden sm:flex items-center space-x-4">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-base font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              <FaSignOutAlt className="w-5 h-5 text-lg" />
              <span className="text-base font-semibold">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          ) : (
            <Link
              to="/register"
              className="px-4 py-2 rounded-md text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Sign Up
            </Link>
          )}
        </div>

        {/* Mobile menu (dropdown) */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 border-b border-gray-800 z-50 sm:hidden">
            <div className="flex flex-col items-center py-4 space-y-2">
              {user && (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-md text-base font-semibold transition-colors w-full justify-center ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaHome className="mr-2 text-lg" /> Dashboard
                  </NavLink>
                  <NavLink
                    to="/expenses"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-md text-base font-semibold transition-colors w-full justify-center ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaChartLine className="mr-2 text-lg" /> Expenses
                  </NavLink>
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-md text-base font-semibold transition-colors w-full justify-center ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaCog className="mr-2 text-lg" /> Settings
                  </NavLink>
                </>
              )}
              <div className="w-full flex items-center justify-center mt-2">
                {user ? (
                  <button
                    onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-md text-base font-semibold text-red-400 hover:text-red-300 transition-colors w-full justify-center"
                  >
                    <FaSignOutAlt className="w-5 h-5 text-lg" />
                    <span className="text-base font-semibold">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                ) : (
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-md text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors w-full text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 
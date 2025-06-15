import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // List of public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/onboarding'];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // If we're on a public route, don't redirect
    if (publicRoutes.includes(location.pathname)) {
        return children;
    }

    // For protected routes, redirect to onboarding if not authenticated
    if (!user) {
        return <Navigate to="/onboarding" replace />;
    }

    return (
        <ExpenseProvider>
            <Layout>{children}</Layout>
        </ExpenseProvider>
    );
};

// Root redirect component
const RootRedirect = () => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return <Navigate to={user ? "/dashboard" : "/onboarding"} replace />;
};

// App Routes component
const AppRoutes = () => {
    return (
        <Routes>
            {/* Root path - always redirect to onboarding or dashboard */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Public Routes */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/expenses"
                element={
                    <ProtectedRoute>
                        <Expenses />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <CurrencyProvider>
                    <ThemeProvider>
                        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                            <AppRoutes />
                            <ToastContainer
                                position="top-right"
                                autoClose={3000}
                                hideProgressBar={false}
                                newestOnTop
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                                theme="dark"
                            />
                        </div>
                    </ThemeProvider>
                </CurrencyProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
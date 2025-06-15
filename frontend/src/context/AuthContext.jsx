import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // List of public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/onboarding'];

    // Set up axios interceptor for token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Add response interceptor to handle token expiration
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                    setUser(null);
                    
                    // Only redirect if we're not on a public route
                    if (!publicRoutes.includes(location.pathname)) {
                        navigate('/onboarding');
                        toast.error('Session expired. Please login again.');
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [navigate, location]);

    // Verify token and get user data
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // If no token, just set loading to false and return
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.data) {
                    setUser(response.data);
                }
            } catch (error) {
                console.error('Token verification failed:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, []); // Empty dependency array to run only once on mount

    const login = async (email, password) => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            toast.success('Login successful!');
            navigate('/dashboard');
            return user;
        } catch (error) {
            let errorMessage = 'Login failed';
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        errorMessage = 'Invalid email or password';
                        break;
                    case 401:
                        errorMessage = 'Invalid email or password';
                        break;
                    case 404:
                        errorMessage = 'User not found';
                        break;
                    default:
                        errorMessage = error.response.data?.message || 'Login failed';
                }
            }
            toast.error(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            toast.success('Registration successful!');
            navigate('/onboarding');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        navigate('/onboarding');
        toast.success('Logged out successfully');
    };

    const checkAuth = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/verify');
            if (response.data) {
                setUser(response.data);
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
                setUser(null);
            }
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        checkAuth,
        setUser
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 
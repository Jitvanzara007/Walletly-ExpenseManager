import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.status, error.response?.data);
        
        if (error.response?.status === 401) {
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                toast.error('Session expired. Please login again.');
                window.location.href = '/login';
            }
        } else if (error.response?.status === 500) {
            toast.error('Server error. Please try again later.');
        } else if (!error.response) {
            toast.error('Network error. Please check your connection.');
        }
        
        return Promise.reject(error);
    }
);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (err) {
            console.error('Auth check error:', err);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            toast.success('Login successful!');
            return user;
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/auth/register', userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            toast.success('Registration successful!');
            return user;
        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.info('Logged out successfully');
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
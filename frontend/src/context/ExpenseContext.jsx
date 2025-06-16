import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import config from '../config';

// Create axios instance with default config
const api = axios.create({
    baseURL: `${config.API_URL}/api`,
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
}, (error) => {
    return Promise.reject(error);
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
        }
        return Promise.reject(error);
    }
);

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Get all transactions
    const getTransactions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                navigate('/login');
                return;
            }

            console.log('Fetching transactions...');
            const response = await api.get('/expenses/dashboard');
            console.log('Dashboard data received:', response.data);
            
            // Extract transactions from dashboard data
            const transactionsData = response.data.recent_transactions || [];
            console.log('Extracted transactions:', transactionsData);
            
            setTransactions(transactionsData);
            setError(null);
            return transactionsData;
        } catch (err) {
            console.error('Error fetching transactions:', err);
            const errorMessage = err.response?.data?.message || 'Failed to fetch transactions';
            setError(errorMessage);
            toast.error(errorMessage);
            if (err.response?.status === 401) {
                navigate('/login');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Create a new transaction
    const createTransaction = async (transactionData) => {
        try {
            setLoading(true);
            console.log('Creating transaction:', transactionData);
            const response = await api.post('/expenses', transactionData);
            console.log('Transaction created:', response.data);
            setTransactions(prev => [response.data, ...prev]);
            return response.data;
        } catch (err) {
            console.error('Error creating transaction:', err);
            const errorMessage = err.response?.data?.message || 'Failed to create transaction';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update a transaction
    const updateTransaction = async (id, transactionData) => {
        try {
            const response = await api.put(`/expenses/${id}`, transactionData);
            console.log('Update response:', response.data);
            
            if (response.data.transactions) {
                setTransactions(response.data.transactions);
            }
            
            return response.data;
        } catch (err) {
            console.error('Error updating transaction:', err);
            const errorMessage = err.response?.data?.message || 'Failed to update transaction';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        }
    };

    // Delete a transaction
    const deleteTransaction = async (id) => {
        try {
            setLoading(true);
            console.log('Deleting transaction:', id);
            const response = await api.delete(`/expenses/${id}`);
            console.log('Delete response:', response.data);
            
            if (response.data && response.data.transactions) {
                setTransactions(response.data.transactions);
            }
            
            return response.data;
        } catch (err) {
            console.error('Error deleting transaction:', err);
            const errorMessage = err.response?.data?.message || 'Failed to delete transaction';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get transaction summary
    const getTransactionSummary = async () => {
        try {
            setLoading(true);
            console.log('Fetching transaction summary...');
            const response = await api.get('/expenses/dashboard');
            console.log('Transaction summary received:', response.data);
            return response.data;
        } catch (err) {
            console.error('Error fetching transaction summary:', err);
            const errorMessage = err.response?.data?.message || 'Failed to fetch transaction summary';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Load initial data
    useEffect(() => {
        console.log('Loading initial data...');
        getTransactions();
    }, []);

    const value = {
        transactions,
        loading,
        error,
        getTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionSummary
    };

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpense = () => {
    const context = useContext(ExpenseContext);
    if (!context) {
        throw new Error('useExpense must be used within an ExpenseProvider');
    }
    return context;
}; 
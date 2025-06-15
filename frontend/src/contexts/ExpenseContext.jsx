import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

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

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Categories
  const getCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/expenses/categories');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch categories');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    try {
      setLoading(true);
      const response = await api.post('/expenses/categories/', categoryData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Transactions
  const getTransactions = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await api.get('/expenses');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch transactions');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData) => {
    try {
      setLoading(true);
      console.log('Sending transaction data:', transactionData);
      const response = await api.post('/expenses', transactionData);
      console.log('Transaction created:', response.data);
      return response.data;
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError(err.response?.data?.message || 'Failed to create transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTransactionSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/expenses/dashboard');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch transaction summary');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Budgets
  const getBudgets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/expenses/budgets/');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch budgets');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (budgetData) => {
    try {
      setLoading(true);
      const response = await api.post('/expenses/budgets/', budgetData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create budget');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBudgetStatus = async (budgetId) => {
    try {
      setLoading(true);
      const response = await api.get(`/expenses/budgets/${budgetId}/status/`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch budget status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    error,
    getCategories,
    createCategory,
    getTransactions,
    createTransaction,
    getTransactionSummary,
    getBudgets,
    createBudget,
    getBudgetStatus,
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
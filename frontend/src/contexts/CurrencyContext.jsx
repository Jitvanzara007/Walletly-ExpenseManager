import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CurrencyContext = createContext(null);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem('currency');
    return savedCurrency || 'USD';
  });

  const [exchangeRate, setExchangeRate] = useState(1);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExchangeRate = useCallback(async () => {
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
      const data = await response.json();
      setExchangeRate(data.rates[selectedCurrency]);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    localStorage.setItem('currency', selectedCurrency);
    fetchExchangeRate();
  }, [selectedCurrency, fetchExchangeRate]);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      const currencyList = Object.keys(data.rates);
      setCurrencies(currencyList);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency,
    }).format(amount);
  };

  const convertAmount = (amount) => {
    return amount * exchangeRate;
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        exchangeRate,
        currencies,
        loading,
        formatAmount,
        convertAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext; 
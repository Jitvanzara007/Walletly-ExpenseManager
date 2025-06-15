import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const CurrencyContext = createContext(null);

// Fallback rates in case API fails
const FALLBACK_RATES = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 151.62,
    INR: 83.12,
    AUD: 1.52,
    CAD: 1.35,
    CHF: 0.90,
    CNY: 7.23,
    AED: 3.67
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

// Available currencies with their symbols and names
const CURRENCY_INFO = {
  USD: { symbol: '$', name: 'US Dollar' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  CHF: { symbol: 'Fr', name: 'Swiss Franc' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' }
};

export const CurrencyProvider = ({ children }) => {
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return localStorage.getItem('selectedCurrency') || 'USD';
    });
    const [exchangeRates, setExchangeRates] = useState(FALLBACK_RATES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch exchange rates from API
    const fetchExchangeRates = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Try multiple free APIs in sequence
            try {
                // First try: ExchangeRate-API
                const response = await axios.get('https://open.er-api.com/v6/latest/USD');
                if (response.data && response.data.rates) {
                    setExchangeRates(response.data.rates);
                    return;
                }
            } catch (firstError) {
                console.log('First API failed, trying backup...');
            }

            try {
                // Second try: Frankfurter API
                const response = await axios.get('https://api.frankfurter.app/latest?from=USD');
                if (response.data && response.data.rates) {
                    setExchangeRates(response.data.rates);
                    return;
                }
            } catch (secondError) {
                console.log('Second API failed, using fallback rates...');
            }

            // If both APIs fail, use fallback rates
            setExchangeRates(FALLBACK_RATES);
            setError('Using fallback exchange rates');
            toast.warning('Using fallback exchange rates. Some rates may not be current.');

        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            setExchangeRates(FALLBACK_RATES);
            setError('Using fallback exchange rates');
            toast.warning('Using fallback exchange rates. Some rates may not be current.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch rates on mount and every hour
    useEffect(() => {
        fetchExchangeRates();
        const interval = setInterval(fetchExchangeRates, 3600000); // Update every hour
        return () => clearInterval(interval);
    }, []);

    const changeCurrency = (newCurrency) => {
        if (newCurrency === selectedCurrency) return;
        
        setSelectedCurrency(newCurrency);
        localStorage.setItem('selectedCurrency', newCurrency);
        
        const currencyNames = {
            USD: 'US Dollar',
            EUR: 'Euro',
            GBP: 'British Pound',
            JPY: 'Japanese Yen',
            INR: 'Indian Rupee',
            AUD: 'Australian Dollar',
            CAD: 'Canadian Dollar',
            CHF: 'Swiss Franc',
            CNY: 'Chinese Yuan',
            AED: 'UAE Dirham'
        };

        toast.success(`Currency changed to ${currencyNames[newCurrency]}`);
    };

    const convertAmount = (amount, fromCurrency = 'USD', toCurrency = selectedCurrency) => {
        if (!amount || !exchangeRates) return amount;
        
        // Convert to USD first if fromCurrency is not USD
        const amountInUSD = fromCurrency === 'USD' 
            ? parseFloat(amount)
            : parseFloat(amount) / (exchangeRates[fromCurrency] || 1);
        
        // Convert from USD to target currency
        const convertedAmount = amountInUSD * (exchangeRates[toCurrency] || 1);
        
        // Round to 2 decimal places
        return Math.round(convertedAmount * 100) / 100;
    };

    const formatAmount = (amount, currency = selectedCurrency) => {
        if (!amount) return '0.00';
        
        // Convert the amount if it's not in the target currency
        const convertedAmount = convertAmount(amount, 'USD', currency);
        
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return formatter.format(convertedAmount);
    };

    const getCurrencySymbol = (currency = selectedCurrency) => {
        const symbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            INR: '₹',
            AUD: 'A$',
            CAD: 'C$',
            CHF: 'Fr',
            CNY: '¥',
            AED: 'د.إ'
        };
        return symbols[currency] || currency;
    };

    const getCurrencyName = (currency = selectedCurrency) => {
        const names = {
            USD: 'US Dollar',
            EUR: 'Euro',
            GBP: 'British Pound',
            JPY: 'Japanese Yen',
            INR: 'Indian Rupee',
            AUD: 'Australian Dollar',
            CAD: 'Canadian Dollar',
            CHF: 'Swiss Franc',
            CNY: 'Chinese Yuan',
            AED: 'UAE Dirham'
        };
        return names[currency] || currency;
    };

    const value = {
        selectedCurrency,
        exchangeRates,
        loading,
        error,
        changeCurrency,
        convertAmount,
        formatAmount,
        getCurrencySymbol,
        getCurrencyName
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export default CurrencyContext; 
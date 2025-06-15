import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

const CurrencySelector = () => {
  const { currencies, selectedCurrency, setSelectedCurrency, exchangeRate } = useCurrency();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Default Currency</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select your preferred currency
          </label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency} - {getCurrencyName(currency)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            All amounts will be displayed in {selectedCurrency}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Exchange Rate: 1 USD = {exchangeRate.toFixed(4)} {selectedCurrency}
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to get currency names
const getCurrencyName = (code) => {
  const currencyNames = {
    USD: 'US Dollar',
    INR: 'Indian Rupee',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    AED: 'UAE Dirham',
    // Add more currencies as needed
  };
  return currencyNames[code] || code;
};

export default CurrencySelector; 
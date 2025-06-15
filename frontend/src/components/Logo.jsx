import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg transform rotate-45 flex items-center justify-center">
          <div className="w-6 h-6 bg-white rounded-sm transform -rotate-45 flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-lg">$</span>
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          FinFlow
        </span>
        <span className="text-xs text-gray-500">Smart Expense Manager</span>
      </div>
    </Link>
  );
};

export default Logo; 
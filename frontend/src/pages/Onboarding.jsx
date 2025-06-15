import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaWallet, FaChartLine, FaBell, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const steps = [
  {
    title: 'Track Your Expenses',
    description: 'Monitor your spending habits and keep your finances organized.',
    icon: FaWallet,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    title: 'Smart Analytics',
    description: 'Get insights and visual reports of your financial patterns.',
    icon: FaChartLine,
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Stay Updated',
    description: 'Receive notifications and alerts about your budget and expenses.',
    icon: FaBell,
    color: 'from-pink-500 to-red-500',
  },
  {
    title: 'Secure & Private',
    description: 'Your financial data is encrypted and protected with bank-level security.',
    icon: FaLock,
    color: 'from-red-500 to-orange-500',
  },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (idx) => {
    setCurrentStep(idx);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex flex-col justify-between relative overflow-x-hidden">
      {/* SVG/Gradient/Blob background for creativity */}
      <div className="absolute top-0 left-0 right-0 w-screen overflow-hidden">
        <svg className="w-screen h-56 sm:h-48 md:h-64 lg:h-80" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="url(#heroGradient)" fillOpacity="1" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
          <defs>
            <linearGradient id="heroGradient" x1="0" y1="0" x2="1440" y2="320" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#A21CAF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* Centerpiece: Logo and Illustration */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-2 md:mt-4">
        <img
          src="/walletly.png"
          alt="Walletly Logo"
          className="h-48 w-48 sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-40 lg:w-40 object-contain drop-shadow-2xl mb-4 sm:mb-5 animate-fadeIn"
        />
        <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 sm:mb-4 text-center tracking-tight font-sans px-2">Welcome to Walletly</h1>
        <p className="text-indigo-100 text-center max-w-2xl mb-4 sm:mb-5 text-sm sm:text-base md:text-lg lg:text-xl font-sans px-3">
          Your all-in-one expense manager. Take control of your finances with smart analytics, notifications, and secure data.
        </p>
      </div>
      {/* Skip link always visible at the very top right, fixed position for all screens */}
      <div className="fixed top-3 right-4 z-50">
        <Link to="/login" className="text-indigo-200 hover:text-white text-lg sm:text-xl font-bold underline underline-offset-4 tracking-wide transition-colors duration-200">Skip</Link>
      </div>
      {/* Stepper/Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-2 md:px-0 mt-8 lg:mt-12 mb-24  sm:mb-16  ">
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto mb-3">
          <div className={`w-24 h-24 md:w-32 md:h-32 mb-3 rounded-full bg-gradient-to-r ${steps[currentStep].color} flex items-center justify-center shadow-xl`}>
            {React.createElement(steps[currentStep].icon, { className: 'w-12 h-12 md:w-16 md:h-16 text-white' })}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center font-sans">{steps[currentStep].title}</h2>
          <p className="text-indigo-100 text-lg md:text-xl mb-3 text-center font-sans">{steps[currentStep].description}</p>
        </div>
        {/* Modern horizontal stepper */}
        <div className="w-full max-w-2xl flex items-center justify-center mb-4">
          <div className="flex-1 flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.title}>
                <button
                  onClick={() => goToStep(idx)}
                  className={`flex flex-col items-center focus:outline-none group`}
                  aria-label={`Go to step ${idx + 1}`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    idx === currentStep
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-400 scale-110 shadow-lg'
                      : 'bg-gray-800 border-gray-600 group-hover:border-indigo-400'
                  }`}>
                    {React.createElement(step.icon, { className: 'w-5 h-5 md:w-6 md:h-6 text-white' })}
                  </div>
                  <span className={`mt-2 text-xs md:text-sm font-semibold ${idx === currentStep ? 'text-indigo-200' : 'text-gray-400'}`}>{step.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-2 md:mx-4 rounded-full opacity-60" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* Navigation Buttons */}
        <div className="flex w-full max-w-2xl gap-4 justify-center mb-4">
          <button
            onClick={prevStep}
            className={`flex-1 px-4 py-2 md:px-8 md:py-3 rounded-lg text-white font-semibold text-base md:text-lg transition-all duration-200 ${
              currentStep === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          {currentStep === steps.length - 1 ? (
            <Link
              to="/login"
              className="flex-1 px-4 py-2 md:px-8 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-extrabold text-base md:text-lg rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 text-center shadow-lg scale-105"
            >
              Get Started
            </Link>
          ) : (
            <button
              onClick={nextStep}
              className="flex-1 px-4 py-2 md:px-8 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-base md:text-lg rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 
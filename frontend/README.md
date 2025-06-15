# Expense Manager Frontend

This is the React frontend for the Expense Manager application. It provides a modern, responsive user interface for managing expenses, categories, and budgets.

## Features

- Modern UI with Tailwind CSS
- Responsive design for all devices
- Interactive charts and visualizations
- Real-time data updates
- Form validation and error handling
- Secure authentication

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Development

- The frontend communicates with the Django backend through a proxy configuration
- API requests are handled using Axios
- State management is handled using React hooks
- Styling is done using Tailwind CSS
- Charts are implemented using Chart.js

## Building for Production

To create a production build:

```bash
npm run build
```

This will create a `build` directory with optimized production files.

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/contexts/` - React context providers
- `src/utils/` - Utility functions
- `public/` - Static assets 
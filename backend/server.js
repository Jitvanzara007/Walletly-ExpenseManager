const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
}

// Log environment variables (without sensitive data)
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('=================================');

const app = express();

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://expense-manager-production.up.railway.app',
    'https://expense-manager-frontend-production.up.railway.app'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('Blocked by CORS:', origin);
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        console.log('Allowed by CORS:', origin);
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Import routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

// Register routes
console.log('Registering routes...');
console.log('=================================');

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Connect to MongoDB with retry logic
const connectWithRetry = async() => {
    try {
        await connectDB();
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};

connectWithRetry();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
    });
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({
        message: 'Route not found',
        path: req.url,
        method: req.method
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log('=================================');
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    console.log('Available routes:');
    console.log('- GET /health');
    console.log('- GET /api/test');
    console.log('- POST /api/auth/register');
    console.log('- POST /api/auth/login');
    console.log('- GET /api/auth/me');
    console.log('- GET /api/expenses/dashboard');
    console.log('- GET /api/expenses');
    console.log('- POST /api/expenses');
    console.log('=================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
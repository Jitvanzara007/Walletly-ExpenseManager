const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
require('dotenv').config();

const initializeData = async() => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker');
        console.log('Connected to MongoDB');

        // Clear existing transactions
        await Transaction.deleteMany({});
        console.log('Cleared existing transactions');

        // Sample transactions
        const transactions = [{
                userId: '684ac3f00de1bac8653f4cb7', // Your user ID
                type: 'income',
                amount: 5000,
                category: 'salary',
                description: 'Monthly Salary',
                date: new Date('2024-03-01'),
                paymentMethod: 'bank'
            },
            {
                userId: '684ac3f00de1bac8653f4cb7',
                type: 'expense',
                amount: 1200,
                category: 'housing',
                description: 'Rent Payment',
                date: new Date('2024-03-10'),
                paymentMethod: 'bank'
            },
            {
                userId: '684ac3f00de1bac8653f4cb7',
                type: 'expense',
                amount: 300,
                category: 'utilities',
                description: 'Electricity Bill',
                date: new Date('2024-03-12'),
                paymentMethod: 'card'
            },
            {
                userId: '684ac3f00de1bac8653f4cb7',
                type: 'expense',
                amount: 200,
                category: 'food',
                description: 'Restaurant',
                date: new Date('2024-03-14'),
                paymentMethod: 'card'
            },
            {
                userId: '684ac3f00de1bac8653f4cb7',
                type: 'expense',
                amount: 150,
                category: 'food',
                description: 'Grocery Shopping',
                date: new Date('2024-03-15'),
                paymentMethod: 'card'
            },
            {
                userId: '684ac3f00de1bac8653f4cb7',
                type: 'expense',
                amount: 100,
                category: 'transport',
                description: 'Train Ticket',
                date: new Date('2024-03-13'),
                paymentMethod: 'card'
            }
        ];

        // Insert transactions
        await Transaction.insertMany(transactions);
        console.log('Successfully inserted initial transactions');

        // Verify the data
        const count = await Transaction.countDocuments();
        console.log(`Total transactions in database: ${count}`);

        // Show sample data
        const sampleData = await Transaction.find().sort({ date: -1 });
        console.log('Sample transactions:', JSON.stringify(sampleData, null, 2));

    } catch (error) {
        console.error('Error initializing data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the initialization
initializeData();
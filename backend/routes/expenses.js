const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Create initial transactions for a user
const createInitialTransactions = async(userId) => {
    const initialTransactions = [{
            userId: userId,
            type: 'income',
            amount: 5000,
            category: 'salary',
            description: 'Monthly Salary',
            date: new Date('2024-03-01'),
            paymentMethod: 'bank'
        },
        {
            userId: userId,
            type: 'expense',
            amount: 1200,
            category: 'housing',
            description: 'Rent Payment',
            date: new Date('2024-03-10'),
            paymentMethod: 'bank'
        },
        {
            userId: userId,
            type: 'expense',
            amount: 300,
            category: 'utilities',
            description: 'Electricity Bill',
            date: new Date('2024-03-12'),
            paymentMethod: 'card'
        },
        {
            userId: userId,
            type: 'expense',
            amount: 200,
            category: 'food',
            description: 'Restaurant',
            date: new Date('2024-03-14'),
            paymentMethod: 'card'
        },
        {
            userId: userId,
            type: 'expense',
            amount: 100,
            category: 'transport',
            description: 'Train Ticket',
            date: new Date('2024-03-13'),
            paymentMethod: 'card'
        },
        {
            userId: userId,
            type: 'expense',
            amount: 400,
            category: 'shopping',
            description: 'Clothing & Electronics',
            date: new Date('2024-03-16'),
            paymentMethod: 'card'
        },
        {
            userId: userId,
            type: 'expense',
            amount: 350,
            category: 'entertainment',
            description: 'Movies & Dining',
            date: new Date('2024-03-17'),
            paymentMethod: 'card'
        },
        {
            userId: userId,
            type: 'expense',
            amount: 300,
            category: 'healthcare',
            description: 'Medical Checkup',
            date: new Date('2024-03-18'),
            paymentMethod: 'card'
        },
        {
            userId: userId,
            type: 'expense',
            amount: 150,
            category: 'food',
            description: 'Grocery Shopping',
            date: new Date('2024-03-15'),
            paymentMethod: 'card'
        }
    ];

    try {
        await Transaction.insertMany(initialTransactions);
        console.log('Initial transactions created for user:', userId);
        return true;
    } catch (error) {
        console.error('Error creating initial transactions:', error);
        return false;
    }
};

// Get dashboard data
router.get('/dashboard', auth, async(req, res) => {
    try {
        console.log('Dashboard request received from user:', req.user);

        // Check if user has any transactions
        const existingTransactions = await Transaction.find({ userId: req.user.id });
        console.log('Existing transactions count:', existingTransactions.length);

        // If no transactions exist, create initial ones
        if (existingTransactions.length === 0) {
            console.log('No transactions found, creating initial transactions');
            const initialTransactions = [{
                    userId: req.user.id,
                    type: 'income',
                    amount: 5000,
                    category: 'salary',
                    description: 'Monthly Salary',
                    date: new Date('2024-03-01'),
                    paymentMethod: 'bank'
                },
                {
                    userId: req.user.id,
                    type: 'expense',
                    amount: 1200,
                    category: 'housing',
                    description: 'Rent Payment',
                    date: new Date('2024-03-10'),
                    paymentMethod: 'bank'
                },
                {
                    userId: req.user.id,
                    type: 'expense',
                    amount: 300,
                    category: 'utilities',
                    description: 'Electricity Bill',
                    date: new Date('2024-03-12'),
                    paymentMethod: 'card'
                },
                {
                    userId: req.user.id,
                    type: 'expense',
                    amount: 200,
                    category: 'food',
                    description: 'Restaurant',
                    date: new Date('2024-03-14'),
                    paymentMethod: 'card'
                },
                {
                    userId: req.user.id,
                    type: 'expense',
                    amount: 100,
                    category: 'transport',
                    description: 'Train Ticket',
                    date: new Date('2024-03-13'),
                    paymentMethod: 'card'
                },
                {
                    userId: req.user.id,
                    type: 'expense',
                    amount: 400,
                    category: 'shopping',
                    description: 'Clothing & Electronics',
                    date: new Date('2024-03-16'),
                    paymentMethod: 'card'
                },
                {
                    userId: req.user.id,
                    type: 'expense',
                    amount: 350,
                    category: 'entertainment',
                    description: 'Movies & Dining',
                    date: new Date('2024-03-17'),
                    paymentMethod: 'card'
                },
                {
                    userId: req.user.id,
                    type: 'expense',
                    amount: 300,
                    category: 'healthcare',
                    description: 'Medical Checkup',
                    date: new Date('2024-03-18'),
                    paymentMethod: 'card'
                },
                {
                    userId: req.user.id,
                    type: 'expense',
                    amount: 150,
                    category: 'food',
                    description: 'Grocery Shopping',
                    date: new Date('2024-03-15'),
                    paymentMethod: 'card'
                }
            ];

            await Transaction.insertMany(initialTransactions);
            console.log('Initial transactions created successfully');
        }

        // Get all transactions for the user
        const transactions = await Transaction.find({ userId: req.user.id })
            .sort({ date: -1 });

        // Calculate totals from actual transactions
        let totalIncome = 0;
        let totalExpenses = 0;
        const categoryTotals = {};

        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else if (transaction.type === 'expense') {
                totalExpenses += transaction.amount;
                categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
            }
        });

        const dashboardData = {
            total_income: totalIncome,
            total_expenses: totalExpenses,
            balance: totalIncome - totalExpenses,
            category_totals: categoryTotals,
            recent_transactions: transactions
        };

        console.log('Sending dashboard data for user:', req.user.id);
        console.log('Dashboard data:', dashboardData);
        res.json(dashboardData);
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// Create a new transaction
router.post('/', auth, async(req, res) => {
    try {
        const { type, amount, category, date, description, paymentMethod } = req.body;
        console.log('Creating new transaction:', {
            userId: req.user.id,
            type,
            amount,
            category,
            date,
            description,
            paymentMethod
        });

        // Validate required fields
        if (!type || !amount || !category || !date) {
            console.log('Missing required fields');
            return res.status(400).json({
                message: 'Missing required fields'
            });
        }

        // Create new transaction
        const newTransaction = new Transaction({
            userId: req.user.id,
            type,
            amount: parseFloat(amount),
            category,
            date: new Date(date),
            description: description || 'No description',
            paymentMethod: paymentMethod || 'cash'
        });

        // Save the transaction
        const savedTransaction = await newTransaction.save();
        console.log('Transaction saved successfully:', savedTransaction);

        // Verify the transaction was saved
        const verifiedTransaction = await Transaction.findById(savedTransaction._id);
        if (!verifiedTransaction) {
            console.error('Transaction not found after saving');
            throw new Error('Transaction not saved properly');
        }

        console.log('Transaction verified in database:', verifiedTransaction);
        res.status(201).json(savedTransaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// Get all transactions
router.get('/', auth, async(req, res) => {
    try {
        console.log('Get all transactions request for user:', req.user.id);

        const transactions = await Transaction.find({ userId: req.user.id })
            .sort({ date: -1 });

        console.log('Found transactions count:', transactions.length);
        console.log('Transactions:', transactions);

        res.json(transactions);
    } catch (error) {
        console.error('Error getting transactions:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// Update a transaction
router.put('/:id', auth, async(req, res) => {
    try {
        const transactionId = req.params.id;
        console.log('Update transaction request for ID:', transactionId);
        console.log('Update data:', req.body);

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(transactionId)) {
            console.log('Invalid transaction ID format:', transactionId);
            return res.status(400).json({
                message: 'Invalid transaction ID format'
            });
        }

        // First check if transaction exists and belongs to user
        const existingTransaction = await Transaction.findOne({
            _id: new mongoose.Types.ObjectId(transactionId),
            userId: req.user.id
        });

        if (!existingTransaction) {
            console.log('Transaction not found or unauthorized');
            return res.status(404).json({
                message: 'Transaction not found or unauthorized'
            });
        }

        // Update the transaction
        const { type, amount, category, date, description, paymentMethod } = req.body;

        // Validate required fields
        if (!type || !amount || !category || !date) {
            console.log('Missing required fields');
            return res.status(400).json({
                message: 'Missing required fields'
            });
        }

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            new mongoose.Types.ObjectId(transactionId), {
                type,
                amount: parseFloat(amount),
                category,
                date: new Date(date),
                description: description || 'No description',
                paymentMethod: paymentMethod || 'cash'
            }, { new: true } // Return the updated document
        );

        if (!updatedTransaction) {
            console.log('Failed to update transaction');
            return res.status(500).json({
                message: 'Failed to update transaction'
            });
        }

        console.log('Transaction updated successfully:', updatedTransaction);
        res.json(updatedTransaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        // Check if error is due to invalid ID format
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid transaction ID'
            });
        }
        res.status(500).json({
            message: 'Failed to update transaction',
            error: error.message
        });
    }
});

// Delete a transaction
router.delete('/:id', auth, async(req, res) => {
    try {
        const transactionId = req.params.id;
        console.log('Delete transaction request for ID:', transactionId);
        console.log('User ID:', req.user.id);

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(transactionId)) {
            console.log('Invalid transaction ID format:', transactionId);
            return res.status(400).json({
                message: 'Invalid transaction ID format'
            });
        }

        // First check if transaction exists and belongs to user
        const transaction = await Transaction.findOne({
            _id: new mongoose.Types.ObjectId(transactionId),
            userId: req.user.id
        });

        if (!transaction) {
            console.log('Transaction not found or unauthorized');
            return res.status(404).json({
                message: 'Transaction not found or unauthorized'
            });
        }

        // Delete the transaction
        const result = await Transaction.deleteOne({
            _id: new mongoose.Types.ObjectId(transactionId)
        });
        console.log('Delete result:', result);

        if (result.deletedCount === 0) {
            console.log('No transaction was deleted');
            return res.status(404).json({
                message: 'Transaction not found'
            });
        }

        // Get updated transactions list
        const updatedTransactions = await Transaction.find({ userId: req.user.id })
            .sort({ date: -1 });

        console.log('Transaction deleted successfully');
        res.json({
            message: 'Transaction deleted successfully',
            deletedId: transactionId,
            transactions: updatedTransactions
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        // Check if error is due to invalid ID format
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid transaction ID'
            });
        }
        res.status(500).json({
            message: 'Failed to delete transaction',
            error: error.message
        });
    }
});

// Delete all transactions for a user
router.delete('/delete-all', auth, async(req, res) => {
    try {
        console.log('Delete all transactions request for user:', req.user.id);

        const result = await Transaction.deleteMany({ userId: req.user.id });
        console.log('Deleted transactions count:', result.deletedCount);

        res.json({
            message: 'All transactions deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting all transactions:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// Create initial transactions for existing users
router.post('/create-initial', auth, async(req, res) => {
    try {
        const userId = req.user.id;
        console.log('Creating initial transactions for user:', userId);

        // Delete existing transactions first
        await Transaction.deleteMany({ userId });

        const initialTransactions = [{
                userId: userId,
                type: 'income',
                amount: 5000,
                category: 'salary',
                description: 'Monthly Salary',
                date: new Date('2024-03-01'),
                paymentMethod: 'bank'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 1200,
                category: 'housing',
                description: 'Rent Payment',
                date: new Date('2024-03-10'),
                paymentMethod: 'bank'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 300,
                category: 'utilities',
                description: 'Electricity Bill',
                date: new Date('2024-03-12'),
                paymentMethod: 'card'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 200,
                category: 'food',
                description: 'Restaurant',
                date: new Date('2024-03-14'),
                paymentMethod: 'card'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 100,
                category: 'transport',
                description: 'Train Ticket',
                date: new Date('2024-03-13'),
                paymentMethod: 'card'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 400,
                category: 'shopping',
                description: 'Clothing & Electronics',
                date: new Date('2024-03-16'),
                paymentMethod: 'card'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 350,
                category: 'entertainment',
                description: 'Movies & Dining',
                date: new Date('2024-03-17'),
                paymentMethod: 'card'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 300,
                category: 'healthcare',
                description: 'Medical Checkup',
                date: new Date('2024-03-18'),
                paymentMethod: 'card'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 150,
                category: 'food',
                description: 'Grocery Shopping',
                date: new Date('2024-03-15'),
                paymentMethod: 'card'
            }
        ];

        await Transaction.insertMany(initialTransactions);
        console.log('Initial transactions created for user:', userId);

        res.status(201).json({
            message: 'Initial transactions created successfully',
            transactions: initialTransactions
        });
    } catch (error) {
        console.error('Error creating initial transactions:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

// Force reset all transactions
router.post('/force-reset', auth, async(req, res) => {
    try {
        const userId = req.user.id;
        console.log('Force resetting all transactions for user:', userId);

        // Delete all existing transactions
        const deleteResult = await Transaction.deleteMany({ userId });
        console.log('Deleted transactions:', deleteResult);

        // Create new transactions with correct totals
        const initialTransactions = [{
                userId: userId,
                type: 'income',
                amount: 5000,
                category: 'salary',
                description: 'Monthly Salary',
                date: new Date('2024-03-01'),
                paymentMethod: 'bank'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 1200,
                category: 'housing',
                description: 'Rent Payment',
                date: new Date('2024-03-10'),
                paymentMethod: 'bank'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 300,
                category: 'utilities',
                description: 'Electricity Bill',
                date: new Date('2024-03-12'),
                paymentMethod: 'card'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 200,
                category: 'food',
                description: 'Restaurant',
                date: new Date('2024-03-14'),
                paymentMethod: 'card'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 100,
                category: 'transport',
                description: 'Train Ticket',
                date: new Date('2024-03-13'),
                paymentMethod: 'card'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 400,
                category: 'shopping',
                description: 'Clothing & Electronics',
                date: new Date('2024-03-16'),
                paymentMethod: 'card'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 350,
                category: 'entertainment',
                description: 'Movies & Dining',
                date: new Date('2024-03-17'),
                paymentMethod: 'card'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 300,
                category: 'healthcare',
                description: 'Medical Checkup',
                date: new Date('2024-03-18'),
                paymentMethod: 'card'
            },
            {
                userId: userId,
                type: 'expense',
                amount: 150,
                category: 'food',
                description: 'Grocery Shopping',
                date: new Date('2024-03-15'),
                paymentMethod: 'card'
            }
        ];

        const insertResult = await Transaction.insertMany(initialTransactions);
        console.log('Inserted transactions:', insertResult);

        // Verify the totals
        const allTransactions = await Transaction.find({ userId });
        let totalIncome = 0;
        let totalExpenses = 0;
        allTransactions.forEach(t => {
            if (t.type === 'income') totalIncome += t.amount;
            else totalExpenses += t.amount;
        });
        console.log('Verification - Total Income:', totalIncome);
        console.log('Verification - Total Expenses:', totalExpenses);
        console.log('Verification - Balance:', totalIncome - totalExpenses);

        res.status(201).json({
            message: 'Transactions force reset successfully',
            transactions: insertResult,
            totals: {
                income: totalIncome,
                expenses: totalExpenses,
                balance: totalIncome - totalExpenses
            }
        });
    } catch (error) {
        console.error('Error force resetting transactions:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
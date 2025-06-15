const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create initial transactions for a user
const createInitialTransactions = async(userId) => {
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

    try {
        await Transaction.insertMany(initialTransactions);
        console.log('Initial transactions created for user:', userId);
        return true;
    } catch (error) {
        console.error('Error creating initial transactions:', error);
        return false;
    }
};

// Register route
router.post('/register', async(req, res) => {
    try {
        console.log('Registration attempt:', {...req.body, password: '[REDACTED]' });
        const { email, password, name } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
            console.log('Missing required fields:', { email: !!email, password: !!password, name: !!name });
            return res.status(400).json({
                message: 'All fields are required',
                missing: {
                    email: !email,
                    password: !password,
                    name: !name
                }
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format:', email);
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Validate password length
        if (password.length < 6) {
            console.log('Password too short');
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({
            email,
            password,
            name
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();
        console.log('User registered successfully:', email);

        // Create initial transactions for the new user
        await createInitialTransactions(user._id);

        // Generate JWT token
        const token = jwt.sign({ userId: user._id.toString() },
            process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' }
        );

        console.log('Token generated with user ID:', {
            userId: user._id.toString(),
            userIdType: typeof user._id.toString()
        });

        res.status(201).json({
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                currency: user.currency,
                language: user.language,
                theme: user.theme
            }
        });
    } catch (error) {
        console.error('Registration error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login route
router.post('/login', async(req, res) => {
    try {
        console.log('=== LOGIN DEBUG START ===');
        console.log('1. Login attempt:', {
            email: req.body.email,
            hasPassword: !!req.body.password
        });

        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            console.log('2. Missing required fields:', {
                email: !!email,
                password: !!password
            });
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        // Check if user exists
        console.log('3. Searching for user with email:', email);
        const user = await User.findOne({ email });
        console.log('3. User found:', user ? {
            id: user._id.toString(),
            email: user.email
        } : 'Not found');

        if (!user) {
            console.log('4. User not found');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        console.log('5. Verifying password for user:', user.email);
        const isMatch = await user.comparePassword(password);
        console.log('5. Password verification result:', isMatch);

        if (!isMatch) {
            console.log('6. Invalid password');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        console.log('7. Generating token for user:', {
            userId: user._id.toString(),
            email: user.email
        });

        const token = jwt.sign({ userId: user._id.toString() },
            process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' }
        );

        console.log('8. Token generated successfully with user ID:', {
            userId: user._id.toString(),
            userIdType: typeof user._id.toString()
        });

        res.json({
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                currency: user.currency,
                language: user.language,
                theme: user.theme
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        console.log('=== LOGIN DEBUG END ===');
        res.status(500).json({
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get current user route
router.get('/me', auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(401).json({ message: 'Token is not valid' });
    }
});

// Profile update route
router.put('/profile', auth, async(req, res) => {
    try {
        console.log('Profile update attempt:', req.body);
        const { name, username } = req.body;
        const userId = req.user.id;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields if provided
        if (name) user.name = name;
        if (username) user.username = username;

        // Save updated user
        await user.save();
        console.log('Profile updated successfully for user:', userId);

        // Return updated user data (excluding password)
        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            username: user.username,
            currency: user.currency,
            language: user.language,
            theme: user.theme
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
});

// Update password route
router.put('/password', auth, async(req, res) => {
    try {
        // Log everything about the request
        console.log('=== PASSWORD UPDATE DEBUG START ===');
        console.log('1. Request details:', {
            path: req.path,
            method: req.method,
            headers: {
                ...req.headers,
                authorization: req.headers.authorization ? '[REDACTED]' : undefined
            },
            userFromToken: req.user,
            body: {
                ...req.body,
                currentPassword: '[REDACTED]',
                newPassword: '[REDACTED]'
            }
        });

        // Get ALL users from database and log their IDs
        const allUsers = await User.find({}).select('_id email name');
        console.log('2. All users in database:', allUsers.map(u => ({
            id: u._id.toString(),
            email: u.email,
            name: u.name
        })));

        // Log the token and its contents
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                console.log('3. Token details:', {
                    hasToken: true,
                    decodedUserId: decoded.userId,
                    decodedUserIdType: typeof decoded.userId,
                    tokenExpiry: new Date(decoded.exp * 1000).toISOString()
                });
            } catch (err) {
                console.log('3. Token decode error:', {
                    message: err.message,
                    name: err.name,
                    stack: err.stack
                });
            }
        } else {
            console.log('3. No authorization header found');
        }

        const { currentPassword, newPassword } = req.body;

        // Try to find user by ID from token
        console.log('4. Searching for user with ID:', {
            id: req.user.id,
            idType: typeof req.user.id,
            idLength: req.user.id.length
        });

        const userById = await User.findById(req.user.id);
        console.log('4. User by ID result:', userById ? {
            id: userById._id.toString(),
            email: userById.email,
            name: userById.name
        } : 'Not found');

        // If we found the user, proceed with password update
        const user = userById;
        if (!user) {
            console.log('5. User not found in database');
            console.log('=== PASSWORD UPDATE DEBUG END ===');
            return res.status(404).json({
                message: 'User not found',
                debug: {
                    searchedId: req.user.id,
                    availableUsers: allUsers.map(u => ({
                        id: u._id.toString(),
                        email: u.email
                    }))
                }
            });
        }

        // Verify current password
        console.log('6. Verifying current password for user:', {
            id: user._id.toString(),
            email: user.email
        });
        const isMatch = await user.comparePassword(currentPassword);
        console.log('6. Password verification result:', isMatch);

        if (!isMatch) {
            console.log('7. Current password is incorrect');
            console.log('=== PASSWORD UPDATE DEBUG END ===');
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        console.log('8. Updating password for user:', {
            id: user._id.toString(),
            email: user.email
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        console.log('9. Password updated successfully');
        console.log('=== PASSWORD UPDATE DEBUG END ===');
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password update error:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            userId: req.user ? req.user.id : undefined
        });
        console.log('=== PASSWORD UPDATE DEBUG END ===');
        res.status(500).json({ message: 'Server error during password update' });
    }
});

// Forgot Password Endpoint
router.post('/forgot-password', async(req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        // Always respond with success for security
        return res.json({ message: 'If this email exists, a reset link will be sent.' });
    }

    // Generate a reset token (valid for 1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Set up nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    const mailOptions = {
        to: user.email,
        from: 'YOUR_GMAIL@gmail.com',
        subject: 'Password Reset',
        text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'If this email exists, a reset link will be sent.' });
});

// Reset Password Endpoint
router.post('/reset-password', async(req, res) => {
    const { token, password } = req.body;
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
        return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset.' });
});

module.exports = router;
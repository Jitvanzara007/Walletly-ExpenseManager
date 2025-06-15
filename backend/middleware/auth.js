const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async(req, res, next) => {
    try {
        console.log('=== AUTH MIDDLEWARE DEBUG START ===');
        console.log('1. Request details:', {
            path: req.path,
            method: req.method,
            hasAuthHeader: !!req.headers.authorization,
            headers: {
                ...req.headers,
                authorization: req.headers.authorization ? '[REDACTED]' : undefined
            }
        });

        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('2. No authorization header found');
            console.log('=== AUTH MIDDLEWARE DEBUG END ===');
            return res.status(401).json({ message: 'No authorization token' });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        console.log('3. Token extracted:', {
            hasToken: !!token,
            tokenLength: token ? token.length : 0
        });

        if (!token) {
            console.log('4. No token found in authorization header');
            console.log('=== AUTH MIDDLEWARE DEBUG END ===');
            return res.status(401).json({ message: 'No token found' });
        }

        // Verify JWT secret is set
        if (!process.env.JWT_SECRET) {
            console.log('5. JWT_SECRET not set in environment');
            console.log('=== AUTH MIDDLEWARE DEBUG END ===');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // Verify token
        console.log('6. Attempting to verify token');
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            console.log('6. Token verified:', {
                hasDecoded: !!decoded,
                decodedKeys: Object.keys(decoded),
                userId: decoded.userId,
                userIdType: typeof decoded.userId,
                userIdLength: decoded.userId ? decoded.userId.length : 0,
                tokenExpiry: new Date(decoded.exp * 1000).toISOString()
            });
        } catch (error) {
            console.log('6. Token verification failed:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Invalid token' });
        }

        if (!decoded.userId) {
            console.log('7. No userId found in decoded token');
            console.log('=== AUTH MIDDLEWARE DEBUG END ===');
            return res.status(401).json({ message: 'Invalid token format' });
        }

        // Find user in database
        console.log('8. Searching for user with ID:', {
            id: decoded.userId,
            idType: typeof decoded.userId,
            idLength: decoded.userId.length
        });

        let user;
        try {
            // Try to find user by ID
            user = await User.findById(decoded.userId);
            if (!user) {
                // If not found by ID, try to find by email (as a fallback)
                console.log('8. User not found by ID, trying to find by email...');
                const allUsers = await User.find({}).select('_id email');
                console.log('8. All users in database:', allUsers.map(u => ({
                    id: u._id.toString(),
                    email: u.email
                })));
            }
        } catch (error) {
            console.error('8. Error finding user:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            return res.status(500).json({ message: 'Error finding user' });
        }

        console.log('8. User search result:', user ? {
            id: user._id.toString(),
            email: user.email,
            name: user.name
        } : 'Not found');

        if (!user) {
            console.log('9. User not found in database');
            console.log('=== AUTH MIDDLEWARE DEBUG END ===');
            return res.status(404).json({
                message: 'User not found',
                debug: {
                    searchedId: decoded.userId,
                    searchedIdType: typeof decoded.userId
                }
            });
        }

        // Set user in request
        req.user = {
            id: user._id.toString(),
            email: user.email
        };
        console.log('10. User set in request:', {
            id: req.user.id,
            email: req.user.email
        });

        console.log('=== AUTH MIDDLEWARE DEBUG END ===');
        next();
    } catch (error) {
        console.error('Auth middleware error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        console.log('=== AUTH MIDDLEWARE DEBUG END ===');
        res.status(500).json({ message: 'Server error during authentication' });
    }
};
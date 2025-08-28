const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId: userId }, 
        process.env.JWT_SECRET || 'your-secret-key-here', 
        { expiresIn: '7d' }
    );
};

// Register new user
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.username === username ? 
                    'Username already exists' : 'Email already exists'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        // Save to database (password will be automatically hashed)
        await user.save();

        // Generate token for immediate login
        const token = generateToken(user._id);

        // Return success response (don't send password back!)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages[0] // Send first validation error
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }

        // Generic error
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username or email
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};
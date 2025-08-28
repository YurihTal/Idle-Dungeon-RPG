// Import required libraries
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((error) => console.error('❌ MongoDB connection error:', error));

// Routes
app.use('/api/auth', authRoutes);

// Basic test route (keep this for now)
app.get('/', (req, res) => {
    res.json({ message: 'Idle RPG Server is running!' });
});

// Test route to see all routes
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working!',
        availableEndpoints: [
            'POST /api/auth/register',
            'POST /api/auth/login'
        ]
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});
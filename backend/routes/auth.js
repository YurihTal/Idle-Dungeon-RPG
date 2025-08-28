const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

// Create router instance
const router = express.Router();

// POST /api/auth/register - Create new user account
router.post('/register', registerUser);

// POST /api/auth/login - User login
router.post('/login', loginUser);

// Export the router
module.exports = router;
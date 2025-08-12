const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/authController');

// Public route for user login
router.post('/login', loginUser);

// Public route for user registration (consider protecting this with an admin-only key in production)
router.post('/register', registerUser);

module.exports = router;

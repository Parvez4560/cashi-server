const express = require('express');
const router = express.Router();

// Controller থেকে ফাংশন ইমপোর্ট
const { registerUser, getUserProfile } = require('../controllers/userController');

// Middleware থেকে protect ইমপোর্ট (যেটা টোকেন যাচাই করে)
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/user/register
// @access  Public
router.post('/register', registerUser);

// @route   GET /api/user/profile
// @access  Private (শুধু লগইন ইউজার)
router.get('/profile', protect, getUserProfile);

// রাউটার এক্সপোর্ট
module.exports = router;
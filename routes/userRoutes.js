const express = require('express');
const { registerUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // টোকেন চেক (যদি ব্যবহার করেন)
const router = express.Router();

// ✅ রেজিস্ট্রেশন
router.post('/register', registerUser);

// ✅ প্রোফাইল (লগইন হলে)
router.get('/profile', protect, getUserProfile);

module.exports = router;
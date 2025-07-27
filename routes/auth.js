const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // আপনার মডেল

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';
const JWT_EXPIRES_IN = '365d';

// ✅ Check Account (Phone Exists) - GET with query parameter
router.get('/check-number', async (req, res) => {
  const phone = req.query.number; // Flutter থেকে ?number= আসছে
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    const user = await User.findOne({ phone });
    if (user) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Register (POST)
router.post('/register', async (req, res) => {
  const {
    phone,
    password,
    name = '',
    businessName = '',
    email = '',
    fatherName = '',
    motherName = '',
    address = '',
    profileImage = '',
  } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: 'Phone and password are required' });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      phone,
      password, // আপনার মডেলে password হ্যাশিং নিশ্চিত করুন
      name,
      businessName,
      email,
      fatherName,
      motherName,
      address,
      profileImage,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        businessName: user.businessName,
        email: user.email,
        fatherName: user.fatherName,
        motherName: user.motherName,
        address: user.address,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Login (POST)
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: 'Phone and password are required' });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this phone number' });
    }

    const isMatch = await user.matchPassword(password);  // মডেলে matchPassword ফাংশন থাকা লাগবে
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        businessName: user.businessName,
        email: user.email,
        fatherName: user.fatherName,
        motherName: user.motherName,
        address: user.address,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Placeholder OTP (optional)
router.post('/send-otp', (req, res) => {
  return res.status(200).json({ message: 'OTP service coming soon!' });
});

module.exports = router;
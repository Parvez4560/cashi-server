const express = require('express');
const router = express.Router();
const User = require('../models/User');

// রেজিস্ট্রেশন API
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'সব তথ্য পূরণ করুন' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'ইমেইল ইতিমধ্যেই ব্যবহার হয়েছে' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: 'রেজিস্ট্রেশন সফল হয়েছে', userId: newUser._id });
  } catch (err) {
    console.error('রেজিস্ট্রেশন ত্রুটি:', err);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
});

// লগইন API
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'ইমেইল এবং পাসওয়ার্ড দিন' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'ইমেইল সঠিক নয়' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'পাসওয়ার্ড সঠিক নয়' });
    }

    res.status(200).json({
      message: 'লগইন সফল হয়েছে',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('লগইন ত্রুটি:', err);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
});

module.exports = router;
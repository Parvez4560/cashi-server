const User = require('../models/userModel'); // ইউজার মডেল ইমপোর্ট
const bcrypt = require('bcryptjs');

// রেজিস্টার ইউজার
const registerUser = async (req, res) => {
  const { name, phone, password, email, address, fatherName, motherName, businessName, profileImage } = req.body;

  try {
    // যদি ফোন নাম্বার আগেই থাকে
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    // পাসওয়ার্ড হ্যাশ
    const hashedPassword = await bcrypt.hash(password, 10);

    // নতুন ইউজার তৈরি
    const newUser = await User.create({
      name,
      phone,
      password: hashedPassword,
      email,
      address,
      fatherName,
      motherName,
      businessName,
      profileImage,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ইউজার প্রোফাইল
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  getUserProfile,
};
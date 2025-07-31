import User from '../models/User.js';

// ✅ রেজিস্ট্রেশন
export const registerUser = async (req, res) => {
  const {
    name,
    phone,
    password,
    email,
    address,
    fatherName,
    motherName,
    businessName,
    profileImage,
  } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: 'Phone and password are required' });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    const newUser = await User.create({
      name,
      phone,
      password,
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
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ ইউজার প্রোফাইল (প্রয়োজনে)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
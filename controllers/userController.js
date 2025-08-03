import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ✅ JWT Token Generator
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "365d" });
};

// ✅ Register User
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
    return res.status(400).json({ message: "Phone and password are required" });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    // ✅ Hash password (PIN)
    const hashedPassword = await bcrypt.hash(password, 10);

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

    // ✅ Send response with token
    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(newUser._id),
      user: {
        id: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Login User
export const loginUser = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: "Phone and password are required" });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "No account found with this phone number" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
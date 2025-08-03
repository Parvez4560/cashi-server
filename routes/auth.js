import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// ✅ Always load JWT_SECRET from env, fallback if missing
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
const JWT_EXPIRES_IN = "365d";

// ✅ Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ✅ Check Number
router.get("/check-number", async (req, res) => {
  const phone = req.query.number;
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    const user = await User.findOne({ phone });
    return res.status(200).json({ exists: !!user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Register
router.post("/register", async (req, res) => {
  const {
    phone,
    password,
    name = "",
    businessName = "",
    email = "",
    fatherName = "",
    motherName = "",
    address = "",
    profileImage = "",
  } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: "Phone and password are required" });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      phone,
      password: hashedPassword,
      name,
      businessName,
      email,
      fatherName,
      motherName,
      address,
      profileImage,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
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
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
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

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
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
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
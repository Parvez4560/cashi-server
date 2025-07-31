import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // ✅ মডেল অবশ্যই .js সহ

const router = express.Router();

// ✅ JWT Secret & Expire
const JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret";
const JWT_EXPIRES_IN = "365d";

// ✅ Helper Function: Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ✅ Register API
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "সব তথ্য পূরণ করুন" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "ইমেইল ইতিমধ্যেই ব্যবহার হয়েছে" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "রেজিস্ট্রেশন সফল হয়েছে",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("রেজিস্ট্রেশন ত্রুটি:", err);
    res.status(500).json({ message: "সার্ভার সমস্যা" });
  }
});

// ✅ Login API
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "ইমেইল এবং পাসওয়ার্ড দিন" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "ইমেইল সঠিক নয়" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "পাসওয়ার্ড সঠিক নয়" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "লগইন সফল হয়েছে",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("লগইন ত্রুটি:", err);
    res.status(500).json({ message: "সার্ভার সমস্যা" });
  }
});

export default router; // ✅ ESM Export
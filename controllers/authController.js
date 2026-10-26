import User from "../models/User.js";
import { translate } from "../utils/translator.js";

// ইউজার লগইন কন্ট্রোলার
export const loginUser = async (req, res) => {
  const lang = req.headers["accept-language"] || "en";
  const { phone, pin } = req.body;

  if (!phone || !pin) {
    return res.status(400).json({ message: translate(lang, "errors.invalid_request") });
  }

  try {
    // এখানে ডাটাবেজ চেক করার লজিক বসবে
    res.json({ message: translate(lang, "success.login"), phone });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ইউজার বা মার্চেন্ট রেজিস্ট্রেশন কন্ট্রোলার
export const registerUser = async (req, res) => {
  const lang = req.headers["accept-language"] || "en";
  const { phone, pin, accountType, subCategory, businessName } = req.body;

  if (!phone || !pin || !accountType) {
    return res.status(400).json({ message: translate(lang, "errors.invalid_request") });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this phone number." });
    }

    const newUser = new User({
      phone,
      pin, // পরবর্তীতে bcrypt দিয়ে হ্যাশ করে নিতে হবে
      accountType,
      subCategory: subCategory || (accountType === "merchant" ? "retail" : "standard"),
      businessName: accountType === "merchant" ? businessName : undefined
    });

    await newUser.save();
    res.status(201).json({ message: "Registration successful!", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
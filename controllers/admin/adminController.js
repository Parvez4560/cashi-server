import Admin from "../../models/admin/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { email, password, deviceToken, deviceName } = req.body;

    // চেক করা ফ্রন্টএন্ড থেকে જરૂરી ডাটাগুলো আসছে কি না
    if (!email || !password || !deviceToken) {
      return res.status(400).json({ success: false, message: "ইমেইল, পাসওয়ার্ড এবং ডিভাইস টোকেন আবশ্যক!" });
    }

    // ১. অ্যাডমিন খোঁজা
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: "অ্যাডমিন পাওয়া যায়নি!" });
    }

    // ২. পাসওয়ার্ড মেলানো
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "ভুল পাসওয়ার্ড!" });
    }

    // যদি অ্যারে না থাকে, তবে ইনিশিয়ালাইজ করা
    if (!admin.allowedDeviceTokens) {
      admin.allowedDeviceTokens = [];
    }

    // ৩. চেক করা ডিভাইসটি আগে থেকেই রেজিস্টার্ড কি না
    const existingDevice = admin.allowedDeviceTokens.find(d => d.deviceToken === deviceToken);

    if (!existingDevice) {
      // এখানে লিমিট চেক করা হচ্ছে (যেমন: সর্বোচ্চ ১টি ডিভাইস রেজিস্টার্ড থাকতে পারবে)
      if (admin.allowedDeviceTokens.length < 1) {
        admin.allowedDeviceTokens.push({
          deviceName: deviceName || "Unknown Device",
          deviceToken: deviceToken
        });
        await admin.save();
      } else {
        return res.status(403).json({ 
          success: false, 
          unauthorizedDevice: true, 
          message: "আপনার অ্যাকাউন্ট সুরক্ষিত রাখতে অপরিচিত ডিভাইস থেকে লগইন ব্লক করা হয়েছে।" 
        });
      }
    }

    // ৪. JWT টোকেন তৈরি করা (Access Token)
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "লগইন সফল হয়েছে!",
      token
    });

  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ success: false, message: "সার্ভার ইন্টারনাল এরর!" });
  }
};
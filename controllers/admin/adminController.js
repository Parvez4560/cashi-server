import Admin from "../../models/admin/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { email, password, deviceToken, deviceName, deviceLabel } = req.body;

    if (!email || !password || !deviceToken) {
      return res.status(400).json({
        success: false,
        message: "ইমেইল, পাসওয়ার্ড এবং ডিভাইস টোকেন আবশ্যক!",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "অ্যাডমিন পাওয়া যায়নি!",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "ভুল পাসওয়ার্ড!",
      });
    }

    if (!Array.isArray(admin.allowedDeviceTokens)) {
      admin.allowedDeviceTokens = [];
    }

    const existingDevice = admin.allowedDeviceTokens.find(
      (d) => d.deviceToken === deviceToken
    );

    if (existingDevice) {
      if (existingDevice.isActive === false) {
        return res.status(403).json({
          success: false,
          unauthorizedDevice: true,
          message: "এই ডিভাইসটির অ্যাক্সেস নিষ্ক্রিয় করা হয়েছে!",
        });
      }

      existingDevice.lastUsedAt = new Date();
      if (deviceName) existingDevice.deviceName = deviceName;
      if (deviceLabel) existingDevice.deviceLabel = deviceLabel;
      await admin.save();
    } else {
      const activeDevicesCount = admin.allowedDeviceTokens.filter(
        (d) => d.isActive !== false
      ).length;

      if (activeDevicesCount < 1) {
        admin.allowedDeviceTokens.push({
          deviceName: deviceName || "Unknown Device",
          deviceLabel: deviceLabel || "",
          deviceToken,
          isActive: true,
          lastUsedAt: new Date(),
        });
        await admin.save();
      } else {
        return res.status(403).json({
          success: false,
          unauthorizedDevice: true,
          message:
            "আপনার অ্যাকাউন্ট সুরক্ষিত রাখতে অপরিচিত ডিভাইস থেকে লগইন ব্লক করা হয়েছে।",
        });
      }
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role || "admin",
        deviceToken,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "লগইন সফল হয়েছে!",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "সার্ভার ইন্টারনাল এরর!",
    });
  }
};
import RegistrationOtp from '../../models/otp/registrationOtpModel.js';
import jwt from 'jsonwebtoken';

// ১. রেজিস্ট্রেশনের জন্য ওটিপি পাঠানো
export const sendRegistrationOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await RegistrationOtp.deleteMany({ phone });
    await RegistrationOtp.create({ phone, otp });

    console.log(`[REGISTRATION OTP] Phone: ${phone} -> OTP: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "Registration OTP sent successfully."
    });

  } catch (error) {
    console.error("Send Registration OTP Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ২. ওটিপি ভেরিফাই করে .env এর JWT_SECRET দিয়ে ১০ মিনিটের টোকেন তৈরি করা
export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone number and OTP are required." });
    }

    const record = await RegistrationOtp.findOne({ phone, otp });
    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    // 🔹 .env থেকে JWT_SECRET ব্যবহার করে টোকেন তৈরি (মেয়াদ ১০ মিনিট)
    const verificationToken = jwt.sign(
      { phone: record.phone, purpose: 'registration' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    record.token = verificationToken;
    record.isVerified = true;
    await record.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can proceed with registration.",
      verificationToken // ফ্রন্টএন্ড এই টোকেনটি সংরক্ষণ করবে
    });

  } catch (error) {
    console.error("Verify Registration OTP Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
import RegistrationOtp from '../../models/otp/registrationOtpModel.js';
import crypto from 'crypto';

// ১. রেজিস্ট্রেশনের জন্য ওটিপি পাঠানো
export const sendRegistrationOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required." });
    }

    // ৪ ডিজিটের র্যান্ডম ওটিপি তৈরি
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // আগের কোনো ওটিপি থাকলে মুছে ফেলা
    await RegistrationOtp.deleteMany({ phone });

    // নতুন ওটিপি সেভ করা
    await RegistrationOtp.create({ phone, otp });

    // (আপনার ব্যাকগ্রাউন্ড এসএমএস গেটওয়ে অ্যাপ এই ওটিপিটি ইউজারের সিমে পাঠিয়ে দেবে)
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

// ২. ওটিপি ভেরিফাই করে রেজিস্ট্রেশন টোকেন জেনারেট করা (যার মাধ্যমে ফর্ম সাবমিট হবে)
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

    // ১০ মিনিটের একটি সিক্রেট ভেরিফিকেশন টোকেন তৈরি
    const verificationToken = crypto.randomBytes(32).toString('hex');

    record.token = verificationToken;
    record.isVerified = true;
    await record.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can proceed with registration.",
      verificationToken // ফ্রন্টএন্ড এই টোকেনটি সংরক্ষণ করবে এবং ফাইনাল রেজিস্ট্রেশনের সময় পাঠাবে
    });

  } catch (error) {
    console.error("Verify Registration OTP Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
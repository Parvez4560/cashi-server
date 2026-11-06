import RegistrationOtp from '../../models/otp/registrationOtpModel.js';
import SmsQueue from '../../models/sms/smsQueueModel.js';
import jwt from 'jsonwebtoken';

// ১. ৬-সংখ্যার ওটিপি তৈরি এবং এসএমএস কিউ-তে এন্ট্রি করা
export const sendRegistrationOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required." });
    }

    // ৬-সংখ্যার র্যান্ডম ওটিপি তৈরি
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // আগের কোনো ওটিপি থাকলে মুছে ফেলা
    await RegistrationOtp.deleteMany({ phone });
    await RegistrationOtp.create({ phone, otp });

    // মেসেজ তৈরি করা
    const message = `Your CashI Merchant Registration OTP is: ${otp}. Valid for 3 minutes.`;

    // অ্যান্ড্রয়েড SMS Gateway অ্যাপের জন্য কিউ-তে সেভ করা
    await SmsQueue.create({
      mobileNumber: phone,
      message: message,
      status: 'PENDING'
    });

    return res.status(200).json({
      success: true,
      message: "6-digit OTP queued successfully for SMS Gateway."
    });

  } catch (error) {
    console.error("Send Registration OTP Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ২. ওটিপি ভেরিফাই করে JWT টোকেন জেনারেট করা (মেয়াদ এক্সপায়ার্ড ও ভুল ওটিপি আলাদা হ্যান্ডেলিং সহ)
export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone number and OTP are required." });
    }

    // শুধু ফোন নম্বর দিয়ে ডেটাবেজ রেকর্ড চেক করা (মডেলের expires প্রপার্টির কারণে মেয়াদ শেষ হলে এটি স্বয়ংক্রিয়ভাবে ভ্যানিশ হয়ে যায়)
    const record = await RegistrationOtp.findOne({ phone });
    
    if (!record) {
      return res.status(400).json({ 
        success: false, 
        errorType: "EXPIRED", // 🔹 মেয়াদ শেষ বা রেকর্ড না থাকলে
        message: "ওটিপির মেয়াদ শেষ হয়ে গেছে। দয়া করে নতুন করে ওটিপি পাঠান।" 
      });
    }

    // ওটিপি ভুল হলে
    if (record.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        errorType: "INVALID_OTP", // 🔹 ভুল ওটিপির জন্য
        message: "ভুল ওটিপি কোড দেওয়া হয়েছে! দয়া করে সঠিক কোডটি দিন।" 
      });
    }

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
      message: "OTP verified successfully.",
      verificationToken
    });

  } catch (error) {
    console.error("Verify Registration OTP Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
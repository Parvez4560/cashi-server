import Account from "../../models/Account.js";
import jwt from "jsonwebtoken";

// ১. ওটিপি পাঠানো
export const sendLoginOtp = async (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber) return res.status(400).json({ success: false });

  try {
    const user = await Account.findOne({ mobileNumber });
    if (!user || (user.status !== "ACTIVE" && user.status !== "PENDING")) {
      return res.status(403).json({ success: false });
    }

    return res.status(200).json({
      success: true,
      otpDemo: "1234" // টেস্টিংয়ের জন্য
    });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

// ২. ওটিপি ও ডিভাইস টোকেন একসাথে ভেরিফাই করা (৫ মিনিটের সময়সীমা সহ)
export const verifyLoginOtp = async (req, res) => {
  const { mobileNumber, otp, deviceToken } = req.body;
  
  if (!mobileNumber || !otp || !deviceToken || otp !== "1234") {
    return res.status(400).json({ success: false });
  }

  // ওটিপি এবং ডিভাইস টোকেনকে ক্রিপ্টোগ্রাফিক্যালি বাইন্ড করে ৫ মিনিটের টেম্পোরারি টোকেন ইস্যু
  const otpVerifyToken = jwt.sign(
    { mobileNumber, deviceToken, purpose: "otp_verified" },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );

  return res.status(200).json({
    success: true,
    otpVerifyToken
  });
};

// ৩. পিন ভেরিফাই করে ডিভাইস পার্মানেন্টলি সেভ ও অ্যাক্সেস/রিফ্রেশ টোকেন দেওয়া
export const firstTimePinLogin = async (req, res) => {
  const { mobileNumber, pin, otpVerifyToken, deviceToken } = req.body;

  if (!mobileNumber || !pin || !otpVerifyToken || !deviceToken) {
    return res.status(400).json({ success: false });
  }

  try {
    const decoded = jwt.verify(otpVerifyToken, process.env.JWT_SECRET);
    
    // ডিভাইস টোকেন এবং মোবাইল নম্বর ক্রস-চেক ও ভেরিফাই
    if (
      decoded.mobileNumber !== mobileNumber || 
      decoded.purpose !== "otp_verified" || 
      decoded.deviceToken !== deviceToken
    ) {
      return res.status(401).json({ success: false });
    }

    const user = await Account.findOne({ mobileNumber });
    if (!user || user.pin !== pin) {
      return res.status(401).json({ success: false });
    }

    // লং-টার্ম রিফ্রেশ টোকেন
    const refreshToken = jwt.sign(
      { accountId: user.accountId, deviceToken, purpose: "refresh" },
      process.env.JWT_SECRET
    );

    // ১৫ মিনিটের শর্ট-লাইফ অ্যাক্সেস টোকেন
    const accessToken = jwt.sign(
      { accountId: user.accountId, mobileNumber: user.mobileNumber, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // সফলভাবে পিন দেওয়ার পরই কেবল ডিভাইস ও রিফ্রেশ টোকেন সার্ভারে সেভ হবে
    if (!user.trustedDevices) user.trustedDevices = [];
    user.trustedDevices = user.trustedDevices.filter(d => d.deviceToken !== deviceToken);
    user.trustedDevices.push({ deviceToken, refreshToken });
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        accountId: user.accountId,
        defaultVirtualId: user.defaultVirtualId,
        ownerName: user.ownerName,
        accountType: user.accountType
      }
    });
  } catch (error) {
    return res.status(401).json({ success: false });
  }
};

// ৪. পরবর্তী দ্রুত লগইন (ওটিপি ছাড়া শুধু রিফ্রেশ টোকেন, ডিভাইস টোকেন ও পিন দিয়ে)
export const quickPinLogin = async (req, res) => {
  const { pin, refreshToken, deviceToken } = req.body;

  if (!pin || !refreshToken || !deviceToken) {
    return res.status(400).json({ success: false });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.purpose !== "refresh" || decoded.deviceToken !== deviceToken) {
      return res.status(401).json({ success: false });
    }

    const user = await Account.findOne({ accountId: decoded.accountId });
    if (!user || user.pin !== pin) {
      return res.status(401).json({ success: false });
    }

    const isTrusted = user.trustedDevices?.some(
      d => d.deviceToken === deviceToken && d.refreshToken === refreshToken
    );

    if (!isTrusted) {
      return res.status(401).json({ success: false });
    }

    const accessToken = jwt.sign(
      { accountId: user.accountId, mobileNumber: user.mobileNumber, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        accountId: user.accountId,
        defaultVirtualId: user.defaultVirtualId,
        ownerName: user.ownerName,
        accountType: user.accountType
      }
    });
  } catch (error) {
    return res.status(401).json({ success: false });
  }
};
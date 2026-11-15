import Account from "../../models/Account.js";
import SmsQueue from "../../models/sms/smsQueueModel.js";
import jwt from "jsonwebtoken";

// ১. ওটিপি পাঠানো (৬ ডিজিট, SmsQueue এবং সাময়িক ডিভাইস বাইন্ডিং সহ)
export const sendLoginOtp = async (req, res) => {
  const { mobileNumber, deviceToken } = req.body;

  if (!mobileNumber || !deviceToken) {
    return res.status(400).json({ success: false });
  }

  try {
    const user = await Account.findOne({ mobileNumber });
    if (!user || (user.status !== "ACTIVE" && user.status !== "PENDING")) {
      return res.status(403).json({ success: false });
    }

    // ৬ ডিজিটের র্যান্ডম ওটিপি জেনারেট করা
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ওটিপি, ১২০ সেকেন্ডের এক্সপায়ারি এবং সিকিউরিটির জন্য ডিভাইস টোকেন সাময়িকভাবে সেভ করা
    user.tempOtp = otp;
    user.tempOtpExpiresAt = new Date(Date.now() + 120 * 1000); 
    user.tempDeviceToken = deviceToken; // <-- ডিভাইস বাইন্ডিং লক
    await user.save();

    // আপনার দেওয়া নির্দিষ্ট ফরম্যাটে এসএমএস টেক্সট তৈরি করা
    const messageText = `<#> NEVER share your Verification Code and PIN with anyone. 𝐂𝐚𝐬𝐡𝐈 never asks for these. Verification Code: ${otp}. Expiry: 120 seconds.`;

    // SmsQueue-তে মেসেজ এন্ট্রি করা (অ্যান্ড্রয়েড অ্যাপ এটি ফেচ করে এসএমএস পাঠিয়ে দেবে)
    await SmsQueue.create({
      mobileNumber,
      message: messageText,
      status: 'PENDING'
    });

    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error("Send Login OTP Error:", error);
    return res.status(500).json({ success: false });
  }
};

// ২. ওটিপি ভেরিফাই এবং পিনের ধরণ চেক করা (ডিভাইস বাইন্ডিং সিকিউরিটি সহ)
export const verifyLoginOtp = async (req, res) => {
  const { mobileNumber, otp, deviceToken } = req.body;
  
  if (!mobileNumber || !otp || !deviceToken) {
    return res.status(400).json({ success: false });
  }

  try {
    const user = await Account.findOne({ mobileNumber });
    if (!user) {
      return res.status(404).json({ success: false });
    }

    // সিকিউরিটি চেক: ওটিপি রিকোয়েস্ট করা ডিভাইস এবং ভেরিফাই করতে চাওয়া ডিভাইস এক কি না চেক করা
    if (!user.tempDeviceToken || user.tempDeviceToken !== deviceToken) {
      return res.status(401).json({ success: false, message: "Device mismatch" });
    }

    // ডেটাবেজের ওটিপির সাথে মিল আছে কি না চেক করা
    if (!user.tempOtp || user.tempOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // ওটিপির মেয়াদ শেষ হয়েছে কি না চেক করা
    if (user.tempOtpExpiresAt && new Date() > new Date(user.tempOtpExpiresAt)) {
      return res.status(400).json({ success: false, message: "OTP Expired" });
    }

    // সফলভাবে ভেরিফাই হওয়ার পর সাময়িক ওটিপি ও ডিভাইস ফিল্ডগুলো ক্লিয়ার করে দেওয়া
    user.tempOtp = undefined;
    user.tempOtpExpiresAt = undefined;
    user.tempDeviceToken = undefined;
    await user.save();

    const otpVerifyToken = jwt.sign(
      { mobileNumber, deviceToken, purpose: "otp_verified" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    return res.status(200).json({
      success: true,
      otpVerifyToken,
      isTempPin: user.isTempPin
    });

  } catch (error) {
    console.error("Verify Login OTP Error:", error);
    return res.status(500).json({ success: false });
  }
};

// ৩. পার্মানেন্ট পিন লগইন (এখানেই ফাইনাল ডিভাইস ট্রাস্টেড ও বাইন্ড হয়)
export const firstTimePinLogin = async (req, res) => {
  const { mobileNumber, pin, otpVerifyToken, deviceToken } = req.body;

  if (!mobileNumber || !pin || !otpVerifyToken || !deviceToken) {
    return res.status(400).json({ success: false });
  }

  try {
    const decoded = jwt.verify(otpVerifyToken, process.env.JWT_SECRET);
    
    if (
      decoded.mobileNumber !== mobileNumber || 
      decoded.purpose !== "otp_verified" || 
      decoded.deviceToken !== deviceToken
    ) {
      return res.status(401).json({ success: false });
    }

    const user = await Account.findOne({ mobileNumber });
    if (!user || user.isTempPin || user.pin !== pin) {
      return res.status(401).json({ success: false });
    }

    const refreshToken = jwt.sign(
      { accountId: user.accountId, deviceToken, purpose: "refresh" },
      process.env.JWT_SECRET
    );

    const accessToken = jwt.sign(
      { accountId: user.accountId, mobileNumber: user.mobileNumber, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // 🔥 ফাইনাল পিন সফল হওয়ায় ডিভাইসটি এখন পার্মানেন্টলি ট্রাস্টেড হলো
    user.trustedDevice = { deviceToken, refreshToken, updatedAt: new Date() };
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

// ৪. টেম্পোরারি পিন পরিবর্তন ও নতুন পিন সেট করা (এখানেও ডিভাইস ট্রাস্টেড ও বাইন্ড হয়)
export const setupNewPin = async (req, res) => {
  const { mobileNumber, tempPin, newPin, otpVerifyToken, deviceToken } = req.body;

  if (!mobileNumber || !tempPin || !newPin || !otpVerifyToken || !deviceToken) {
    return res.status(400).json({ success: false });
  }

  try {
    const decoded = jwt.verify(otpVerifyToken, process.env.JWT_SECRET);
    
    if (
      decoded.mobileNumber !== mobileNumber || 
      decoded.purpose !== "otp_verified" || 
      decoded.deviceToken !== deviceToken
    ) {
      return res.status(401).json({ success: false });
    }

    const user = await Account.findOne({ mobileNumber });
    if (!user || !user.isTempPin || user.pin !== tempPin) {
      return res.status(401).json({ success: false });
    }

    user.pin = newPin;
    user.isTempPin = false;
    user.tempPinExpiresAt = null;
    user.tempOtp = undefined;
    user.tempDeviceToken = undefined;

    const refreshToken = jwt.sign(
      { accountId: user.accountId, deviceToken, purpose: "refresh" },
      process.env.JWT_SECRET
    );

    const accessToken = jwt.sign(
      { accountId: user.accountId, mobileNumber: user.mobileNumber, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // 🔥 নতুন পিন সফলভাবে সেট হওয়ায় ডিভাইসটি এখন পার্মানেন্টলি ট্রাস্টেড হলো
    user.trustedDevice = { deviceToken, refreshToken, updatedAt: new Date() };
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

// ৫. দ্রুত পিন লগইন (ওটিপি ছাড়া)
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

    if (
      user.trustedDevice?.deviceToken !== deviceToken || 
      user.trustedDevice?.refreshToken !== refreshToken
    ) {
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
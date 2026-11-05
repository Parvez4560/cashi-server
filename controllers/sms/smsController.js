import Account from "../../models/Account.js";
import SmsQueue from "../../models/sms/smsQueueModel.js"; // 🔹 ইম্পোর্ট করুন

// ১. অ্যান্ড্রয়েড অ্যাপ যখন প্রতি ১০ সেকেন্ড পর পর পেন্ডিং এসএমএস লিস্টের জন্য কল করবে
export const getPendingSmsList = async (req, res) => {
  try {
    const secretKey = req.headers['x-api-key'] || req.query.secretKey;
    if (secretKey && secretKey !== process.env.SMS_GATEWAY_SECRET_KEY) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid Secret Key" });
    }

    // ক. অ্যাকাউন্ট অ্যাপ্রুভালের পেন্ডিং মেসেজগুলো আনা
    const pendingAccounts = await Account.find({ 
      status: "ACTIVE", 
      smsStatus: "PENDING" 
    }).limit(5);

    const accountSmsQueue = pendingAccounts.map(acc => ({
      id: acc._id, // আইডি বা ইউনিক রেফারেন্স
      type: 'ACCOUNT_APPROVAL',
      mobileNumber: acc.mobileNumber,
      message: `Congratulations! Your CashI Merchant Account is Approved. Account ID: ${acc.accountId}, Temporary PIN: ${acc.pin}. Please login and change your PIN immediately.`
    }));

    // খ. রেজিস্ট্রেশন ওটিপির পেন্ডিং মেসেজগুলো আনা
    const pendingOtpSms = await SmsQueue.find({ 
      status: "PENDING" 
    }).limit(5);

    const otpSmsQueue = pendingOtpSms.map(sms => ({
      id: sms._id,
      type: 'OTP_VERIFICATION',
      mobileNumber: sms.mobileNumber,
      message: sms.message
    }));

    // দুটি কিউ একসাথে যুক্ত করা
    const combinedQueue = [...otpSmsQueue, ...accountSmsQueue];

    return res.status(200).json({
      success: true,
      count: combinedQueue.length,
      data: combinedQueue
    });

  } catch (error) {
    console.error("Fetch Pending SMS Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ২. অ্যান্ড্রয়েড অ্যাপ সফলভাবে এসএমএস পাঠিয়ে দেওয়ার পর সার্ভারকে কনফার্ম করবে
export const markSmsAsSent = async (req, res) => {
  try {
    const { id, type, accountId } = req.body;
    
    // যদি এটি রেজিস্ট্রেশন ওটিপি হয়
    if (type === 'OTP_VERIFICATION' && id) {
      await SmsQueue.findByIdAndUpdate(id, { status: "SENT" });
      return res.status(200).json({ success: true, message: "OTP SMS status updated to SENT." });
    }

    // যদি এটি অ্যাকাউন্ট অ্যাপ্রুভাল এসএমএস হয় (আপনার আগের লজিক)
    if (accountId || type === 'ACCOUNT_APPROVAL') {
      const targetId = accountId || id;
      await Account.findOneAndUpdate(
        { $or: [{ accountId: targetId }, { _id: targetId }] }, 
        { smsStatus: "SENT" }
      );
      return res.status(200).json({ success: true, message: `Account SMS status updated to SENT.` });
    }

    return res.status(400).json({ success: false, message: "Invalid request parameters." });

  } catch (error) {
    console.error("Update SMS Status Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
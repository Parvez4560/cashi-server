import Account from "../../models/Account.js";

// ১. অ্যান্ড্রয়েড অ্যাপ যখন প্রতি ১০ সেকেন্ড পর পর পেন্ডিং এসএমএস লিস্টের জন্য কল করবে
export const getPendingSmsList = async (req, res) => {
  try {
    // সিকিউরিটি চেক: অ্যাপের পাঠানো সিক্রেট কি যাচাই করা
    const secretKey = req.headers['x-api-key'] || req.query.secretKey;
    if (secretKey && secretKey !== process.env.SMS_GATEWAY_SECRET_KEY) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid Secret Key" });
    }

    // যে অ্যাকাউন্টগুলোর স্ট্যাটাস ACTIVE কিন্তু এসএমএস পাঠানো এখনো বাকি (PENDING)
    const pendingAccounts = await Account.find({ 
      status: "ACTIVE", 
      smsStatus: "PENDING" 
    }).limit(10); // একবারে ১০টি করে মেসেজ পাঠাবে

    const smsQueue = pendingAccounts.map(acc => ({
      accountId: acc.accountId,
      mobileNumber: acc.mobileNumber,
      message: `Congratulations! Your CashI Merchant Account is Approved. Account ID: ${acc.accountId}, Temporary PIN: ${acc.pin}. Please login and change your PIN immediately.`
    }));

    return res.status(200).json({
      success: true,
      count: smsQueue.length,
      data: smsQueue
    });

  } catch (error) {
    console.error("Fetch Pending SMS Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ২. অ্যান্ড্রয়েড অ্যাপ সফলভাবে এসএমএস পাঠিয়ে দেওয়ার পর সার্ভারকে কনফার্ম করবে
export const markSmsAsSent = async (req, res) => {
  try {
    const { accountId } = req.body;
    
    if (!accountId) {
      return res.status(400).json({ success: false, message: "Account ID is required." });
    }

    await Account.findOneAndUpdate(
      { accountId }, 
      { smsStatus: "SENT" }
    );

    return res.status(200).json({
      success: true,
      message: `SMS status for account ${accountId} updated to SENT.`
    });

  } catch (error) {
    console.error("Update SMS Status Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
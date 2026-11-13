import SmsQueue from "../../models/sms/smsQueueModel.js";

// ১. অ্যান্ড্রয়েড অ্যাপ যখন প্রতি ১০ সেকেন্ড পর পর পেন্ডিং এসএমএস লিস্টের জন্য কল করবে
export const getPendingSmsList = async (req, res) => {
  try {
    const secretKey = req.headers['x-api-key'] || req.query.secretKey;
    if (secretKey && secretKey !== process.env.SMS_GATEWAY_SECRET_KEY) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid Secret Key" });
    }

    // ডাটাবেজ থেকে যেকোনো ধরনের পেন্ডিং মেসেজ (ওটিপি হোক বা অ্যাকাউন্ট অ্যাপ্রুভাল) একসঙ্গে নিয়ে আসা
    const pendingSmsList = await SmsQueue.find({ 
      status: "PENDING" 
    }).limit(10);

    const smsQueueData = pendingSmsList.map(sms => ({
      id: sms._id,
      mobileNumber: sms.mobileNumber,
      message: sms.message
    }));

    return res.status(200).json({
      success: true,
      count: smsQueueData.length,
      data: smsQueueData
    });

  } catch (error) {
    console.error("Fetch Pending SMS Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ২. অ্যান্ড্রয়েড অ্যাপ সফলভাবে এসএমএস পাঠিয়ে দেওয়ার পর সার্ভারকে কনফার্ম করবে
export const markSmsAsSent = async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, message: "SMS ID is required." });
    }

    // আইডি দিয়ে নির্দিষ্ট মেসেজটির স্ট্যাটাস SENT করে দেওয়া
    const updatedSms = await SmsQueue.findByIdAndUpdate(
      id, 
      { status: "SENT" },
      { new: true }
    );

    if (!updatedSms) {
      return res.status(404).json({ success: false, message: "SMS queue item not found." });
    }

    return res.status(200).json({ success: true, message: "SMS status successfully updated to SENT." });

  } catch (error) {
    console.error("Update SMS Status Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
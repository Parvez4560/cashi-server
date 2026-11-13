import Account from "../../../models/Account.js";
import VirtualAccount from "../../../models/VirtualAccount.js";
import SmsQueue from "../../../models/sms/smsQueueModel.js"; // 🔹 SmsQueue ইম্পোর্ট করা হলো
import bcrypt from "bcrypt";

// ৫ ডিজিটের টেম্পোরারি পিন জেনারেটর ফাংশন
const generateTemporaryPin = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// ১. পেন্ডিং অ্যাকাউন্টগুলোর লিস্ট ফেচ করার কন্ট্রোলার
export const getPendingAccountsList = async (req, res) => {
  try {
    // স্ট্যাটাস PENDING থাকা মূল অ্যাকাউন্ট এবং ভার্চুয়াল অ্যাকাউন্টগুলো খুঁজে বের করা
    const pendingMainAccounts = await Account.find({ status: "PENDING" }).select("-pin");
    const pendingVirtualAccounts = await VirtualAccount.find({ status: "PENDING" });

    return res.status(200).json({
      success: true,
      count: pendingMainAccounts.length + pendingVirtualAccounts.length,
      data: {
        mainAccounts: pendingMainAccounts,
        virtualAccounts: pendingVirtualAccounts
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ২. পেন্ডিং অ্যাকাউন্ট স্ট্যাটাস বা ইনফো আপডেট করার কন্ট্রোলার
export const updatePendingAccountStatus = async (req, res) => {
  try {
    const { accountId, virtualId, status, ...updateData } = req.body;

    // 🔒 সিকিউরিটি চেক: কোনোভাবেই যেন ভুলবশত বা হ্যাকিংয়ের মাধ্যমে সংবেদনশীল ফিল্ড আপডেট না হয়
    delete updateData.pin; 
    delete updateData.isTempPin;
    delete updateData.tempPinExpiresAt;
    delete updateData.smsStatus;
    delete updateData.accountId; 
    delete updateData.virtualId;

    if (!["ACTIVE", "PENDING", "REJECTED", "FROZEN", "BLOCKED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    let updatedRecord = null;
    let generatedTempPin = null;

    if (virtualId) {
      updatedRecord = await VirtualAccount.findOneAndUpdate(
        { virtualId },
        { status, ...updateData },
        { new: true }
      );
    } else if (accountId) {
      // অ্যাকাউন্টটি আগে খুঁজে বের করা স্ট্যাটাস ও পিন চেক করার জন্য
      const existingAccount = await Account.findOne({ accountId });
      
      if (!existingAccount) {
        return res.status(404).json({ success: false, message: "Account not found." });
      }

      let smsMessageText = null;
      const accountTypeName = existingAccount.accountType || "Merchant";

      // স্ট্যাটাস পরিবর্তন হলে এসএমএস কিউতে মেসেজ পাঠানোর লজিক
      if (existingAccount.status !== status) {
        
        // 🎯 শর্ত ১: আগের স্ট্যাটাস PENDING এবং বর্তমান স্ট্যাটাস ACTIVE করা হলে, এবং পিন না থাকলে
        if (status === "ACTIVE" && !existingAccount.pin) {
          generatedTempPin = generateTemporaryPin(); // ৫ ডিজিটের টেম্পোরারি পিন
          
          // পিন হ্যাশ করা এবং সিকিউরিটি ফিল্ডগুলো সেট করা
          const salt = await bcrypt.genSalt(10);
          updateData.pin = await bcrypt.hash(generatedTempPin, salt);
          updateData.isTempPin = true;

          // ৩ দিনের (৭২ ঘণ্টা) মেয়াদ সেট করা
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 3);
          updateData.tempPinExpiresAt = expiryDate;

          smsMessageText = `Congratulations! Your CashI ${accountTypeName} Account is Approved. Account ID: ${existingAccount.accountId}, Temporary PIN: ${generatedTempPin}. Please set your PIN within 72 hours.`;
        } 
        // 🎯 শর্ত ২: অ্যাকাউন্ট BLOCKED করা হলে
        else if (status === "BLOCKED") {
          smsMessageText = `Dear Customer, your CashI ${accountTypeName} Account (ID: ${existingAccount.accountId}) has been BLOCKED due to security reasons. Please contact support.`;
        } 
        // 🎯 শর্ত ৩: অ্যাকাউন্ট FROZEN করা হলে
        else if (status === "FROZEN") {
          smsMessageText = `Dear Customer, your CashI ${accountTypeName} Account (ID: ${accountId}) has been FROZEN. Please contact support for details.`;
        } 
        // 🎯 শর্ত ৪: অ্যাকাউন্ট REJECTED করা হলে
        else if (status === "REJECTED") {
          smsMessageText = `Dear Customer, your CashI ${accountTypeName} Account application has been REJECTED. Please contact support for more info.`;
        }
        // 🎯 শর্ত ৫: অন্য কোনো স্ট্যাটাস থেকে পুনরায় ACTIVE করা হলে
        else if (status === "ACTIVE") {
          smsMessageText = `Dear Customer, your CashI ${accountTypeName} Account (ID: ${accountId}) is now ACTIVE. You can login now.`;
        }

        // মেসেজ তৈরি হলে সরাসরি SmsQueue-তে সেভ করা
        if (smsMessageText) {
          await SmsQueue.create({
            mobileNumber: existingAccount.mobileNumber,
            message: smsMessageText,
            status: "PENDING"
          });
        }
      }

      // মূল ডেটাবেজ আপডেট
      updatedRecord = await Account.findOneAndUpdate(
        { accountId },
        { 
          status, 
          ...updateData 
        },
        { new: true, runValidators: true }
      ).select("-pin"); 
    } else {
      return res.status(400).json({ success: false, message: "accountId or virtualId is required." });
    }

    if (!updatedRecord) {
      return res.status(404).json({ success: false, message: "Account not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Account successfully updated and status changed to ${status}.`,
      tempPin: generatedTempPin || undefined, // এডমিন প্যানেল বা টেস্টিংয়ের জন্য
      data: updatedRecord
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
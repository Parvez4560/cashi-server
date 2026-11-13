import Account from "../../../models/Account.js";
import VirtualAccount from "../../../models/VirtualAccount.js";
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

    // 🔒 সিকিউরিটি চেক: কোনোভাবেই যেন ভুলবশত বা হ্যাকিংয়ের মাধ্যমে 'pin' বা সংবেদনশীল ফিল্ড আপডেট না হয়
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

      // 🎯 মূল শর্ত: আগের স্ট্যাটাস PENDING এবং বর্তমান স্ট্যাটাস ACTIVE করা হলে, এবং পিন না থাকলে
      if (existingAccount.status === "PENDING" && status === "ACTIVE" && !existingAccount.pin) {
        generatedTempPin = generateTemporaryPin(); // ৫ ডিজিটের টেম্পোরারি পিন
        
        // পিন হ্যাশ করা এবং সিকিউরিটি ফিল্ডগুলো সেট করা
        const salt = await bcrypt.genSalt(10);
        updateData.pin = await bcrypt.hash(generatedTempPin, salt);
        updateData.isTempPin = true;

        // ৩ দিনের (৭২ ঘণ্টা) মেয়াদ সেট করা
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 3);
        updateData.tempPinExpiresAt = expiryDate;

        // আপনার অ্যান্ড্রয়েড ব্যাকগ্রাউন্ড এসএমএস কিউ সিস্টেমের জন্য স্ট্যাটাস পেন্ডিং করা
        updateData.smsStatus = "PENDING";
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
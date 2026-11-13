import Account from "../../../models/Account.js";
import VirtualAccount from "../../../models/VirtualAccount.js";

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

    // 🔒 সিকিউরিটি চেক: কোনোভাবেই যেন ভুলবশত বা হ্যাকিংয়ের মাধ্যমে 'pin' ফিল্ড আপডেট না হয়
    delete updateData.pin; 
    delete updateData.accountId; 
    delete updateData.virtualId;

    if (!["ACTIVE", "PENDING", "REJECTED", "FROZEN", "BLOCKED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    let updatedRecord = null;

    if (virtualId) {
      updatedRecord = await VirtualAccount.findOneAndUpdate(
        { virtualId },
        { status, ...updateData },
        { new: true }
      );
    } else if (accountId) {
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
      data: updatedRecord
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
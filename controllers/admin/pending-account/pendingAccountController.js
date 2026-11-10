import Account from "../../../models/Account.js";
import VirtualAccount from "../../../models/VirtualAccount.js";

// ১. সমস্ত পেন্ডিং অ্যাকাউন্ট ও সাব-ব্র্যান্ডের লিস্ট ফেচ করা
export const getPendingAccountsList = async (req, res) => {
  try {
    // মূল অ্যাকাউন্ট যেগুলোর স্ট্যাটাস 'PENDING'
    const pendingMainAccounts = await Account.find({ status: "PENDING" }).select("-password");
    
    // ভার্চুয়াল সাব-ব্র্যান্ড অ্যাকাউন্ট যেগুলোর স্ট্যাটাস 'PENDING'
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

// ২. পেন্ডিং অ্যাকাউন্ট বা সাব-ব্র্যান্ড স্ট্যাটাস আপডেট করা (APPROVED/ACTIVE বা BLOCKED করা)
export const updatePendingAccountStatus = async (req, res) => {
  try {
    const { accountId, virtualId, status } = req.body;

    // স্ট্যাটাস শুধু নির্দিষ্ট ভ্যালিড মান হতে পারে কিনা চেক
    if (!["ACTIVE", "PENDING", "BLOCKED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    let updatedRecord = null;

    if (virtualId) {
      // যদি ভার্চুয়াল সাব-ব্র্যান্ড অ্যাকাউন্ট আপডেট করতে হয়
      updatedRecord = await VirtualAccount.findOneAndUpdate(
        { virtualId },
        { status },
        { new: true }
      );
    } else if (accountId) {
      // যদি মূল অ্যাকাউন্ট আপডেট করতে হয়
      updatedRecord = await Account.findOneAndUpdate(
        { accountId },
        { status },
        { new: true }
      );
    } else {
      return res.status(400).json({ success: false, message: "accountId or virtualId is required." });
    }

    if (!updatedRecord) {
      return res.status(404).json({ success: false, message: "Account not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Account status successfully updated to ${status}.`,
      data: updatedRecord
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
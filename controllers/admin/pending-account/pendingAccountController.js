import Account from "../../../models/Account.js";
import VirtualAccount from "../../../models/VirtualAccount.js";

// পেন্ডিং অ্যাকাউন্ট স্ট্যাটাস বা ইনফো আপডেট করার কন্ট্রোলার
export const updatePendingAccountStatus = async (req, res) => {
  try {
    const { accountId, virtualId, status, ...updateData } = req.body;

    // 🔒 সিকিউরিটি চেক: কোনোভাবেই যেন ভুলবশত বা হ্যাকিংয়ের মাধ্যমে 'pin' ফিল্ড আপডেট না হয়
    delete updateData.pin; 
    delete updateData.accountId; // accountId ও পরিবর্তন করা যাবে না
    delete updateData.virtualId;

    if (!["ACTIVE", "PENDING", "REJECTED", "FROZEN", "BLOCKED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    let updatedRecord = null;

    if (virtualId) {
      // ভার্চুয়াল অ্যাকাউন্ট আপডেট
      updatedRecord = await VirtualAccount.findOneAndUpdate(
        { virtualId },
        { status, ...updateData },
        { new: true }
      );
    } else if (accountId) {
      // মূল অ্যাকাউন্ট আপডেট (এখানে pin বাদে বাকি সব প্রোফাইল ডাটা, নাম, ডকুমেন্টস ইত্যাদি আপডেট হতে পারবে)
      updatedRecord = await Account.findOneAndUpdate(
        { accountId },
        { 
          status, 
          ...updateData 
          // এখানে পিন ফিল্ডটি রিমুভ থাকায় পিন কোনোভাবেই হাত পড়বে না
        },
        { new: true, runValidators: true }
      ).select("-pin"); // রেসপন্সেও পিন ফিল্ড কখনো রিটার্ন করা হবে না
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
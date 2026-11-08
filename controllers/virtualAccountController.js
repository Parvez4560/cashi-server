import VirtualAccount from "../models/VirtualAccount.js";
import Account from "../models/Account.js";

// লুহা অ্যালগরিদম চেক ডিজিট
const calculateCheckDigit = (numberStr) => {
  let sum = 0;
  let shouldDouble = true;
  for (let i = numberStr.length - 1; i >= 0; i--) {
    let digit = parseInt(numberStr.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return (10 - (sum % 10)) % 10;
};

// নতুন ভার্চুয়াল আইডি জেনারেটর
const generateVirtualId = async (accountType) => {
  const prefix = accountType && accountType.toUpperCase() === "MERCHANT" ? "2021" : "1010";
  let isUnique = false;
  let virtualId = "";

  while (!isUnique) {
    const randomMiddle = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const base15 = prefix + randomMiddle;
    const checkDigit = calculateCheckDigit(base15);
    virtualId = base15 + checkDigit;

    const existing = await VirtualAccount.findOne({ virtualId });
    if (!existing) isUnique = true;
  }
  return virtualId;
};

// একই কোম্পানির অধীনে নতুন ভার্চুয়াল সার্ভিস/ব্র্যান্ড তৈরি করা
export const createVirtualService = async (req, res) => {
  try {
    const { accountId, brandName, businessCategory, businessMedium, businessAddress, hasTradeLicense, tradeLicenseNumber } = req.body;

    if (!accountId || !brandName) {
      return res.status(400).json({ success: false, message: "accountId and brandName are required." });
    }

    // ১. মেইন একাউন্ট আছে কি না চেক করা
    const parentAccount = await Account.findOne({ accountId });
    if (!parentAccount) {
      return res.status(404).json({ success: false, message: "Main account not found." });
    }

    // ২. নতুন ১৬ ডিজিটের ভার্চুয়াল আইডি তৈরি
    const virtualId = await generateVirtualId(parentAccount.accountType);

    // ৩. নতুন ভার্চুয়াল অ্যাকাউন্ট সেভ করা
    const newService = new VirtualAccount({
      virtualId,
      accountId,
      brandName,
      businessCategory,
      businessMedium,
      businessAddress,
      hasTradeLicense: hasTradeLicense || 'no',
      tradeLicenseNumber: tradeLicenseNumber || '',
      balances: {
        BDT: { "1000": 0 }
      },
      status: "ACTIVE"
    });

    await newService.save();

    return res.status(201).json({
      success: true,
      message: "New virtual service created successfully.",
      data: {
        accountId,
        virtualId,
        brandName: newService.brandName
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
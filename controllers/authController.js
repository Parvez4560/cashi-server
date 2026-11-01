import Account from "../models/Account.js"; // আমাদের নতুন অ্যাকাউন্ট মডেল
import { translate } from "../utils/translator.js";

// ইউজার লগইন কন্ট্রোলার (আগের মতোই থাকবে)
export const loginUser = async (req, res) => {
  const lang = req.headers["accept-language"] || "en";
  const { phone, pin } = req.body;

  if (!phone || !pin) {
    return res.status(400).json({ message: translate(lang, "errors.invalid_request") });
  }

  try {
    // এখানে লগইন লজিক বসবে
    res.json({ message: translate(lang, "success.login"), phone });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ১৬ ডিজিটের কাস্টমার আইডি জেনারেটর ফাংশন
const generateCustomerId = async (accountType) => {
  const prefix = accountType === "MERCHANT" ? "2021" : "1010";
  let isUnique = false;
  let customerId = "";

  while (!isUnique) {
    const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    customerId = prefix + randomDigits;
    const existing = await Account.findOne({ customerId });
    if (!existing) isUnique = true;
  }
  return customerId;
};

// আপডেট করা মার্চেন্ট/ইউজার রেজিস্ট্রেশন কন্ট্রোলার (ডকুমেন্টস ও ওয়ালেট সহ)
export const registerUser = async (req, res) => {
  const lang = req.headers["accept-language"] || "en";
  
  try {
    const bodyData = req.body;
    const { phone, accountType, pin } = bodyData;

    if (!phone || !pin || !accountType) {
      return res.status(400).json({ message: translate(lang, "errors.invalid_request") });
    }

    // ১. চেক করা এই নাম্বারে ইতোমধ্যে অ্যাকাউন্ট আছে কি না
    const existingUser = await Account.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this phone number." });
    }

    // ২. ১৬ ডিজিটের ইউনিক কাস্টমার আইডি তৈরি করা
    const customerId = await generateCustomerId(accountType);

    // ৩. আপলোডকৃত ফাইলগুলোর পাথ সংগ্রহ (যদি ফাইল থাকে)
    const files = req.files || {};
    const documentPaths = {
      nidFront: files.nidFront ? files.nidFront[0].path : null,
      nidBack: files.nidBack ? files.nidBack[0].path : null,
      ownerPhoto: files.ownerPhoto ? files.ownerPhoto[0].path : null,
      nomineeNidDoc: files.nomineeNidDoc ? files.nomineeNidDoc[0].path : null,
      businessShopPhoto: files.businessShopPhoto ? files.businessShopPhoto[0].path : null,
      utilityBillDoc: files.utilityBillDoc ? files.utilityBillDoc[0].path : null,
      tradeLicenseDoc: files.tradeLicenseDoc ? files.tradeLicenseDoc[0].path : null,
    };

    // ৪. নেস্টেড অ্যাড্রেস পার্স করা (যদি স্ট্রিং আকারে আসে)
    const personalAddress = typeof bodyData.personalAddress === 'string' ? JSON.parse(bodyData.personalAddress) : bodyData.personalAddress;
    const businessAddress = typeof bodyData.businessAddress === 'string' ? JSON.parse(bodyData.businessAddress) : bodyData.businessAddress;

    // ৫. নতুন অ্যাকাউন্ট ডেটাবেজে সেভ করা
    const newAccount = new Account({
      customerId,
      accountType: accountType.toUpperCase(),
      subType: bodyData.subType || (accountType.toUpperCase() === "MERCHANT" ? "retail" : "standard"),
      phone,
      pin, // পরবর্তীতে bcrypt দিয়ে হ্যাশ করে নেওয়া ভালো
      email: bodyData.email,
      ownerName: bodyData.ownerName,
      fatherName: bodyData.fatherName,
      motherName: bodyData.motherName,
      spouseName: bodyData.spouseName,
      nidNumber: bodyData.nidNumber,
      dateOfBirth: bodyData.dateOfBirth,
      gender: bodyData.gender,
      occupation: bodyData.occupation,
      monthlyIncome: bodyData.monthlyIncome,
      personalAddress,
      nomineeName: bodyData.nomineeName,
      nomineeRelation: bodyData.nomineeRelation,
      nomineeNid: bodyData.nomineeNid,
      businessName: accountType.toUpperCase() === "MERCHANT" ? bodyData.businessName : undefined,
      businessCategory: bodyData.businessCategory,
      businessMedium: bodyData.businessMedium,
      businessAddress,
      hasTradeLicense: bodyData.hasTradeLicense,
      tradeLicenseNumber: bodyData.tradeLicenseNumber,
      documents: documentPaths,
      status: "PENDING"
    });

    await newAccount.save();

    // ৬. আলাদা ওয়ালেট কালেকশনে ডিফল্ট মেইন ওয়ালেট তৈরি করা
    const defaultWallet = new Wallet({
      customerId,
      walletId: "1000", // মেইন ব্যালেন্স কোড
      serviceName: "Main Balance",
      balance: 0
    });

    await defaultWallet.save();

    res.status(201).json({ 
      success: true,
      message: "Registration successful!", 
      data: {
        customerId,
        phone: newAccount.phone,
        accountType: newAccount.accountType
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
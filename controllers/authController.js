import Account from "../models/Account.js";
import { translate } from "../utils/translator.js";
import mongoose from "mongoose";

// ইউজার লগইন কন্ট্রোলার
export const loginUser = async (req, res) => {
  const lang = req.headers["accept-language"] || "en";
  const { phone, pin } = req.body;

  if (!phone || !pin) {
    return res.status(400).json({ message: translate(lang, "errors.invalid_request") });
  }

  try {
    res.json({ message: translate(lang, "success.login"), phone });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ১৬ ডিজিটের কাস্টমার আইডি জেনারেটর ফাংশন
const generateCustomerId = async (accountType) => {
  const prefix = accountType && accountType.toUpperCase() === "MERCHANT" ? "2021" : "1010";
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

// মার্চেন্ট/ইউজার রেজিস্ট্রেশন কন্ট্রোলার (ডকুমেন্টস, ইন-বিল্ড ব্যালেন্স এবং ক্যাটাগরি ভ্যালিডেশন সহ)
export const registerUser = async (req, res) => {
  const lang = req.headers["accept-language"] || "en";

  try {
    const bodyData = req.body;
    const { phone, pin, accountType } = bodyData;

    if (!phone || !pin || !accountType) {
      return res.status(400).json({ message: translate(lang, "errors.invalid_request") });
    }

    const formattedAccountType = accountType.toUpperCase();
    const subType = bodyData.subType || (formattedAccountType === "MERCHANT" ? "retail" : "standard");

    // ১. ডাটাবেজের `accountcategories` কালেকশন থেকে সাব-টাইপ ভ্যালিডেশন চেক করা
    const validCategory = await mongoose.connection.collection('accountcategories').findOne({
      accountType: formattedAccountType,
      subType: subType
    });

    if (!validCategory) {
      return res.status(400).json({ 
        success: false, 
        message: `অমূল্য বা ভুল সাব-টাইপ (${subType}) প্রদান করা হয়েছে। দয়া করে সঠিক ক্যাটাগরি নির্বাচন করুন।` 
      });
    }

    // ২. চেক করা এই নাম্বারে ইতোমধ্যে অ্যাকাউন্ট আছে কি না
    const existingUser = await Account.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this phone number." });
    }

    // ৩. ১৬ ডিজিটের ইউনিক কাস্টমার আইডি তৈরি করা
    const customerId = await generateCustomerId(formattedAccountType);

    // ৪. আপলোডকৃত ফাইলগুলোর ক্লাউডিনারি পাথ সংগ্রহ (Multer files)
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

    // ৫. নেস্টেড অ্যাড্রেস পার্স করা (যদি স্ট্রিং আকারে আসে)
    const personalAddress = typeof bodyData.personalAddress === 'string' ? JSON.parse(bodyData.personalAddress) : bodyData.personalAddress;
    const businessAddress = typeof bodyData.businessAddress === 'string' ? JSON.parse(bodyData.businessAddress) : bodyData.businessAddress;

    // ৬. নতুন অ্যাকাউন্ট ডেটাবেজে সেভ করা
    const newAccount = new Account({
      customerId,
      accountType: formattedAccountType,
      subType,
      phone,
      pin,
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
      businessName: formattedAccountType === "MERCHANT" ? bodyData.businessName : undefined,
      businessCategory: bodyData.businessCategory,
      businessMedium: bodyData.businessMedium,
      businessAddress,
      hasTradeLicense: bodyData.hasTradeLicense,
      tradeLicenseNumber: bodyData.tradeLicenseNumber,
      documents: documentPaths,
      
      // শুরুতে শুধুমাত্র মেইন ব্যালেন্স (কোড 1000) শূন্য (0) থাকবে
      balances: {
        BDT: {
          "1000": 0
        }
      },

      status: "PENDING",
      isDebitBlocked: false,
      isCreditBlocked: false
    });

    await newAccount.save();

    return res.status(201).json({ 
      success: true,
      message: "Registration successful!", 
      data: {
        customerId,
        phone: newAccount.phone,
        accountType: newAccount.accountType,
        subType: newAccount.subType
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
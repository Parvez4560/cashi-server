import Account from "../models/Account.js";
import { translate } from "../utils/translator.js";
import mongoose from "mongoose";

// ইউজার লগইন কন্ট্রোলার
export const loginUser = async (req, res) => {
  const lang = req.headers["accept-language"] || "en";
  const { mobileNumber, pin } = req.body;

  if (!mobileNumber || !pin) {
    return res.status(400).json({ message: translate(lang, "errors.invalid_request") });
  }

  try {
    res.json({ message: translate(lang, "success.login"), mobileNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// লহ অ্যালগরিদম বা চেক ডিজিট ক্যালকুলেটর (ভুল নম্বর শনাক্তকরণের জন্য)
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

// ১৬ ডিজিটের ইউনিক অ্যাকাউন্ট আইডি জেনারেটর (শুরুতে মার্চেন্ট '2021', পার্সোনাল '1010')
const generateAccountId = async (accountType) => {
  const prefix = accountType && accountType.toUpperCase() === "MERCHANT" ? "2021" : "1010";
  let isUnique = false;
  let accountId = "";

  while (!isUnique) {
    const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    accountId = prefix + randomDigits;
    const existing = await Account.findOne({ accountId });
    if (!existing) isUnique = true;
  }
  return accountId;
};

// ১৬ ডিজিটের ভার্চুয়াল আইডি (Virtual ID) জেনারেটর (চেক ডিজিট সহ)
const generateVirtualId = async (accountType) => {
  const prefix = accountType && accountType.toUpperCase() === "MERCHANT" ? "2021" : "1010";
  let isUnique = false;
  let virtualId = "";

  while (!isUnique) {
    // ১৫ ডিজিটের বেস তৈরি (প্রিফিক্স + ১১ ডিজিট র‍্যান্ডম)
    const randomMiddle = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const base15 = prefix + randomMiddle;
    
    // শেষ ডিজিট হিসেবে চেক ডিজিট যুক্ত করে ১৬ ডিজিট পূর্ণ করা
    const checkDigit = calculateCheckDigit(base15);
    virtualId = base15 + checkDigit;

    const existing = await Account.findOne({ virtualId });
    if (!existing) isUnique = true;
  }
  return virtualId;
};

// মার্চেন্ট/ইউজার রেজিস্ট্রেশন কন্ট্রোলার
export const registerUser = async (req, res) => {
  const lang = req.headers["accept-language"] || "en";

  try {
    const bodyData = req.body;
    
    // 🔹 এখানে কান্ট্রি ও লোকাল নম্বরের ফিল্ডগুলো রিসিভ করার জন্য যুক্ত করা হয়েছে
    const { 
      mobileNumber, 
      accountType, 
      countryName, 
      countryIso, 
      dialCode, 
      localNumber 
    } = bodyData;

    if (!mobileNumber || !accountType) {
      return res.status(400).json({ message: translate(lang, "errors.invalid_request") });
    }

    const formattedAccountType = accountType.toUpperCase();

    // ১. ট্রেড লাইসেন্সের উপস্থিতি অনুযায়ী subType (retail বা micro) নির্ধারণ করা
    let subType = bodyData.subType;
    if (formattedAccountType === "MERCHANT") {
      subType = bodyData.hasTradeLicense && bodyData.hasTradeLicense.toLowerCase() === 'yes' ? 'retail' : 'micro';
    } else {
      subType = bodyData.subType || 'standard';
    }

    // ২. ডাটাবেজের `accountcategories` কালেকশন থেকে সাব-টাইপ ভ্যালিডেশন চেক করা
    const validCategory = await mongoose.connection.collection('accountcategories').findOne({
      accountType: formattedAccountType,
      subType: subType
    });

    if (!validCategory) {
      return res.status(400).json({ 
        success: false, 
        message: `ভুল বা অবৈধ সাব-টাইপ (${subType}) প্রদান করা হয়েছে। দয়া করে সঠিক ক্যাটাগরি নির্বাচন করুন।` 
      });
    }

    // ৩. এই মোবাইল নম্বরে ইতোমধ্যে অ্যাকাউন্ট আছে কি না চেক করা
    const existingUser = await Account.findOne({ mobileNumber });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this mobile number." });
    }

    // ৪. ১৬ ডিজিটের ইউনিক অ্যাকাউন্ট আইডি এবং ভার্চুয়াল আইডি তৈরি করা
    const accountId = await generateAccountId(formattedAccountType);
    const virtualId = await generateVirtualId(formattedAccountType);

    // ৫. আপলোডকৃত ফাইলগুলোর ক্লাউডিনারি পাথ সংগ্রহ
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

    // ৬. নেস্টেড অ্যাড্রেস পার্স করা
    const personalAddress = typeof bodyData.personalAddress === 'string' ? JSON.parse(bodyData.personalAddress) : bodyData.personalAddress;
    const businessAddress = typeof bodyData.businessAddress === 'string' ? JSON.parse(bodyData.businessAddress) : bodyData.businessAddress;

    // ৭. নতুন অ্যাকাউন্ট ডেটাবেজে সেভ করা
    const newAccount = new Account({
      accountId,
      virtualId,
      accountType: formattedAccountType,
      subType,
      mobileNumber,
      countryName, // 🔹 ডেটাবেজে সফলভাবে সেভ হবে
      countryIso,  // 🔹 ডেটাবেজে সফলভাবে সেভ হবে
      dialCode,    // 🔹 ডেটাবেজে সফলভাবে সেভ হবে
      localNumber, // 🔹 ডেটাবেজে সফলভাবে সেভ হবে
      pin: null, 
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
      nomineeDob: bodyData.nomineeDob,
      businessName: formattedAccountType === "MERCHANT" ? bodyData.businessName : undefined,
      businessCategory: bodyData.businessCategory,
      businessMedium: bodyData.businessMedium,
      businessAddress,
      hasTradeLicense: bodyData.hasTradeLicense,
      tradeLicenseNumber: bodyData.tradeLicenseNumber,
      documents: documentPaths,
      
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
      message: "Registration successful! Your account is pending for approval.", 
      data: {
        accountId,
        virtualId,
        mobileNumber: newAccount.mobileNumber,
        accountType: newAccount.accountType,
        subType: newAccount.subType
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
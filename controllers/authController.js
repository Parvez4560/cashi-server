import Account from "../models/Account.js";
import VirtualAccount from "../models/VirtualAccount.js";
import { translate } from "../utils/translator.js";
import mongoose from "mongoose";

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

// লুহা অ্যালগরিদম চেক ডিজিট ক্যালকুলেটর (ভার্চুয়াল আইডির জন্য)
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

// ১. স্বাভাবিক ১২ ডিজিটের মূল অ্যাকাউন্ট আইডি জেনারেটর (কোনো চেক ডিজিট নেই)
const generateAccountId = async (accountType) => {
  const prefix = accountType && accountType.toUpperCase() === "MERCHANT" ? "21" : "10";
  let isUnique = false;
  let accountId = "";

  while (!isUnique) {
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    accountId = prefix + randomDigits;
    const existing = await Account.findOne({ accountId });
    if (!existing) isUnique = true;
  }
  return accountId;
};

// ২. ১৬ ডিজিটের ভার্চুয়াল আইডি জেনারেটর (চেক ডিজিটসহ)
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

// মার্চেন্ট/ইউজার রেজিস্ট্রেশন কন্ট্রোলার
export const registerUser = async (req, res) => {
  const lang = req.headers["accept-language"] || "en";

  try {
    const bodyData = req.body;
    
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

    // ১. সাব-টাইপ নির্ধারণ
    let subType = bodyData.subType;
    if (formattedAccountType === "MERCHANT") {
      subType = bodyData.hasTradeLicense && bodyData.hasTradeLicense.toLowerCase() === 'yes' ? 'retail' : 'micro';
    } else {
      subType = bodyData.subType || 'standard';
    }

    // ২. ক্যাটাগরি ভ্যালিডেশন চেক
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

    // ৩. ইউজার অলরেডি আছে কি না চেক
    const existingUser = await Account.findOne({ mobileNumber });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this mobile number." });
    }

    // ৪. আইডি জেনারেট করা (১২ ডিজিটের মেইন আইডি + ১৬ ডিজিটের ভার্চুয়াল আইডি)
    const accountId = await generateAccountId(formattedAccountType);
    const virtualId = await generateVirtualId(formattedAccountType);

    // ৫. ফাইল পাথ সংগ্রহ
    const files = req.files || {};
    const documentPaths = {
      nidFront: files.nidFront ? files.nidFront[0].path : null,
      nidBack: files.nidBack ? files.nidBack[0].path : null,
      ownerPhoto: files.ownerPhoto ? files.ownerPhoto[0].path : null,
      nomineeNidDoc: files.nomineeNidDoc ? files.nomineeNidDoc[0].path : null,
      utilityBillDoc: files.utilityBillDoc ? files.utilityBillDoc[0].path : null,
      tradeLicenseDoc: files.tradeLicenseDoc ? files.tradeLicenseDoc[0].path : null,
    };

    const personalAddress = typeof bodyData.personalAddress === 'string' ? JSON.parse(bodyData.personalAddress) : bodyData.personalAddress;
    const businessAddress = typeof bodyData.businessAddress === 'string' ? JSON.parse(bodyData.businessAddress) : bodyData.businessAddress;

    // ৬. মেইন অ্যাকাউন্ট ডেটাবেজে সেভ করা (Account Collection)
    const newAccount = new Account({
      accountId,
      accountType: formattedAccountType,
      subType,
      companyName: formattedAccountType === "MERCHANT" ? (bodyData.companyName || bodyData.businessName || bodyData.ownerName || "Merchant Company") : undefined,
      mobileNumber,
      countryName,
      countryIso,
      dialCode,
      localNumber,
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
      documents: {
        nidFront: documentPaths.nidFront,
        nidBack: documentPaths.nidBack,
        ownerPhoto: documentPaths.ownerPhoto,
        nomineeNidDoc: documentPaths.nomineeNidDoc,
        utilityBillDoc: documentPaths.utilityBillDoc
      },
      status: "PENDING"
    });

    await newAccount.save();

    // ৭. প্রথম ভার্চুয়াল অ্যাকাউন্ট বা সাব-সার্ভিস ডেটাবেজে সেভ করা (VirtualAccount Collection)
    const newVirtualAccount = new VirtualAccount({
      virtualId,
      accountId, // মেইন অ্যাকাউন্টের সাথে লিংক থাকল
      brandName: bodyData.businessName || bodyData.ownerName + " Brand",
      businessCategory: bodyData.businessCategory,
      businessMedium: bodyData.businessMedium || "general",
      businessAddress,
      hasTradeLicense: bodyData.hasTradeLicense,
      tradeLicenseNumber: bodyData.tradeLicenseNumber,
      tradeLicenseDoc: documentPaths.tradeLicenseDoc,
      balances: {
        BDT: { "1000": 0 }
      },
      isDefault: true, // মোবাইল নম্বর ভিত্তিক সরাসরি লেনদেনের জন্য এটি ডিফল্ট হিসেবে থাকবে
      status: "ACTIVE"
    });

    await newVirtualAccount.save();

    return res.status(201).json({ 
      success: true,
      message: "Registration successful! Main account and default virtual service created.", 
      data: {
        accountId,   // ১২ ডিজিট
        virtualId,   // ১৬ ডিজিট (লেনদেনের জন্য)
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
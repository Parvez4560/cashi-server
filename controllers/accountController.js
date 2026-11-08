import Account from "../models/Account.js";
import { translate } from "../utils/translator.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// ইউজার লগইন কন্ট্রোলার
export const loginUser = async (req, res) => {
  const lang = req.headers["accept-language"] || "en";
  const { mobileNumber, pin } = req.body;

  if (!mobileNumber || !pin) {
    return res.status(400).json({ message: translate(lang, "errors.invalid_request") });
  }

  try {
    const user = await Account.findOne({ mobileNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: "Account not found with this mobile number." });
    }

    res.json({ message: translate(lang, "success.login"), mobileNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ১৬ ডিজিটের ইউনিক অ্যাকাউন্ট ও ভার্চুয়াল আইডি জেনারেটর ফাংশন
const generateAccountIds = async (accountType) => {
  const prefix = accountType && accountType.toUpperCase() === "MERCHANT" ? "2021" : "1010";
  let isUnique = false;
  let accountId = "";
  let virtualId = "";

  while (!isUnique) {
    const randomDigits1 = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const randomDigits2 = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    
    accountId = prefix + randomDigits1;
    virtualId = prefix + randomDigits2;

    const existing = await Account.findOne({ $or: [{ accountId }, { virtualId }] });
    if (!existing) isUnique = true;
  }
  return { accountId, virtualId };
};

// মার্চেন্ট/ইউজার রেজিস্ট্রেশন কন্ট্রোলার
export const registerUser = async (req, res) => {
  const lang = req.headers["accept-language"] || "en";

  try {
    const bodyData = req.body;
    const { mobileNumber, pin, accountType, verificationToken } = bodyData;

    if (!mobileNumber || !pin || !accountType) {
      return res.status(400).json({ message: translate(lang, "errors.invalid_request") });
    }

    // ১. ওটিপি ভেরিফিকেশন টোকেন চেক করা
    if (!verificationToken) {
      return res.status(400).json({ 
        success: false, 
        message: "Unauthorized! মোবাইল নম্বরটি ওটিপি দিয়ে ভেরিফাই করা হয়নি।" 
      });
    }

    // ২. JWT টোকেন ডিকোড ও ভেরিফাই করা
    try {
      const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);
      
      if (decoded.mobileNumber !== mobileNumber || decoded.purpose !== 'registration') {
        return res.status(400).json({ 
          success: false, 
          message: "ভুল বা অকার্যকর ভেরিফিকেশন টোকেন।" 
        });
      }
    } catch (jwtError) {
      return res.status(400).json({ 
        success: false, 
        message: "ভেরিফিকেশন টোকেনটির মেয়াদ শেষ হয়ে গেছে। দয়া করে আবার ওটিপি ভেরিফাই করুন।" 
      });
    }

    const formattedAccountType = accountType.toUpperCase();
    const subType = bodyData.subType || (formattedAccountType === "MERCHANT" ? "retail" : "standard");

    // ৩. সাব-টাইপ ভ্যালিডেশন চেক করা
    const validCategory = await mongoose.connection.collection('accountcategories').findOne({
      accountType: formattedAccountType,
      subType: subType
    });

    if (!validCategory) {
      return res.status(400).json({ 
        success: false, 
        message: `ভুল বা অবৈধ সাব-টাইপ (${subType}) প্রদান করা হয়েছে।` 
      });
    }

    // ৪. চেক করা এই মোবাইল নাম্বারে ইতোমধ্যে অ্যাকাউন্ট আছে কি না
    const existingUser = await Account.findOne({ mobileNumber });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this mobile number." });
    }

    // ৫. ১৬ ডিজিটের ইউনিক accountId এবং virtualId তৈরি করা
    const { accountId, virtualId } = await generateAccountIds(formattedAccountType);

    // ৬. আপলোডকৃত ফাইলগুলোর ক্লাউডিনারি পাথ সংগ্রহ
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

    // ৭. নেস্টেড অ্যাড্রেস পার্স করা
    const personalAddress = typeof bodyData.personalAddress === 'string' ? JSON.parse(bodyData.personalAddress) : bodyData.personalAddress;
    const businessAddress = typeof bodyData.businessAddress === 'string' ? JSON.parse(bodyData.businessAddress) : bodyData.businessAddress;

    // ৮. নতুন অ্যাকাউন্ট ডেটাবেজে সেভ করা
    const newAccount = new Account({
      accountId,
      virtualId,
      accountType: formattedAccountType,
      subType,
      mobileNumber,
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
      message: "Registration successful!", 
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
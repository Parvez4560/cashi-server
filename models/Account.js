import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true, index: true }, // এটিই মূল অ্যাকাউন্ট বা কাস্টমার আইডি হিসেবে কাজ করবে
  accountType: { type: String, required: true, index: true }, // যেমন: MERCHANT বা PERSONAL
  subType: { type: String, required: true }, // যেমন: retail, online ইত্যাদি
  
  phone: { type: String, required: true, unique: true, index: true },
  pin: { type: String, required: true },
  email: { type: String, required: true },

  ownerName: { type: String, required: true },
  fatherName: { type: String },
  motherName: { type: String },
  spouseName: { type: String },
  nidNumber: { type: String, required: true, index: true },
  dateOfBirth: { type: String },
  gender: { type: String },
  occupation: { type: String },
  monthlyIncome: { type: String },
  personalAddress: {
    division: String,
    district: String,
    upazila: String,
    holdingOrVillage: String
  },

  nomineeName: { type: String },
  nomineeRelation: { type: String },
  nomineeNid: { type: String },

  businessName: { type: String },
  businessCategory: { type: String },
  businessMedium: { type: String },
  businessAddress: {
    division: String,
    district: String,
    upazila: String,
    holdingOrVillage: String
  },
  hasTradeLicense: { type: String, default: 'no' },
  tradeLicenseNumber: { type: String },

  documents: {
    nidFront: { type: String },
    nidBack: { type: String },
    ownerPhoto: { type: String },
    nomineeNidDoc: { type: String },
    businessShopPhoto: { type: String },
    utilityBillDoc: { type: String },
    tradeLicenseDoc: { type: String }
  },

  // 🔹 নতুন ব্যালেন্স স্ট্রাকচার (শুরুতে শুধু BDT এর মেইন ব্যালেন্স '1000' কোডে 0 থাকবে)
  balances: {
    type: Map,
    of: {
      type: Map,
      of: Number
    },
    default: () => ({
      BDT: { "1000": 0 }
    })
  },

  // অ্যাকাউন্ট স্ট্যাটাস ও ট্রানজাকশন কন্ট্রোল ফ্ল্যাগসমূহ
  status: { 
    type: String, 
    enum: ['PENDING', 'ACTIVE', 'REJECTED', 'FROZEN', 'BLOCKED'], 
    default: 'PENDING', 
    index: true 
  },
  isDebitBlocked: { type: Boolean, default: false }, // টাকা পাঠানো বন্ধ করার জন্য
  isCreditBlocked: { type: Boolean, default: false }, // টাকা আসা বন্ধ করার জন্য

  createdAt: { type: Date, default: Date.now }
});

const Account = mongoose.model('Account', accountSchema);
export default Account;
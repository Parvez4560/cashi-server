import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  accountId: { type: String, required: true, unique: true, index: true }, // মূল অ্যাকাউন্ট আইডি
  virtualId: { type: String, required: true, unique: true, index: true }, // ১৬ ডিজিটের ভার্চুয়াল আইডি (লেনদেনের জন্য)
  accountType: { type: String, required: true, index: true }, // MERCHANT বা PERSONAL
  subType: { type: String, required: true }, // retail, standard ইত্যাদি
  
  mobileNumber: { type: String, required: true, unique: true, index: true }, // 🔹 আন্তর্জাতিক ফরম্যাট (+88017...) এখানে সেভ হবে
  localNumber: { type: String },
  countryName: { type: String },
  countryIso: { type: String },
  dialCode: { type: String },
  pin: { type: String, required: false, default: null },
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
  nomineeDob: { type: String },

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

  status: { 
    type: String, 
    enum: ['PENDING', 'ACTIVE', 'REJECTED', 'FROZEN', 'BLOCKED'], 
    default: 'PENDING', 
    index: true 
  },
  isDebitBlocked: { type: Boolean, default: false },
  isCreditBlocked: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
}, {
  versionKey: false
});

const Account = mongoose.model('Account', accountSchema);
export default Account;
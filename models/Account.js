import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true, index: true },
  accountType: { type: String, required: true, index: true },
  subType: { type: String, required: true },
  
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

  status: { type: String, default: 'PENDING', index: true },
  createdAt: { type: Date, default: Date.now }
});

accountSchema.index({ customerId: 1 });
accountSchema.index({ phone: 1 });
accountSchema.index({ nidNumber: 1 });

const Account = mongoose.model('Account', accountSchema);
export default Account;
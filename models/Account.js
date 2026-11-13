import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  accountId: { type: String, required: true, unique: true, index: true },
  accountType: { type: String, required: true, index: true },
  subType: { type: String, required: true },
  companyName: { type: String, required: function() { return this.accountType === 'MERCHANT'; } },
  mobileNumber: { type: String, required: true, unique: true, index: true },
  localNumber: { type: String },
  countryName: { type: String },
  countryIso: { type: String },
  dialCode: { type: String },
  pin: { type: String, required: false, default: null },
  isTempPin: { type: Boolean, default: false },
  tempPinExpiresAt: { type: Date, default: null },
  email: { type: String, required: true },
  virtualIds: [{ type: String }],
  defaultVirtualId: { type: String, default: null },
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

  documents: {
    nidFront: { type: String },
    nidBack: { type: String },
    ownerPhoto: { type: String },
    nomineeNidDoc: { type: String },
    utilityBillDoc: { type: String }
  },

  status: { 
    type: String, 
    enum: ['PENDING', 'ACTIVE', 'REJECTED', 'FROZEN', 'BLOCKED'], 
    default: 'PENDING', 
    index: true 
  },

  createdAt: { type: Date, default: Date.now }
}, {
  versionKey: false
});

const Account = mongoose.model('Account', accountSchema);
export default Account;
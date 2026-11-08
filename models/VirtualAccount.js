import mongoose from 'mongoose';

const virtualAccountSchema = new mongoose.Schema({
  virtualId: { type: String, required: true, unique: true, index: true }, // ১৬ ডিজিটের চেক-ডিজিট যুক্ত ভার্চুয়াল আইডি
  accountId: { type: String, required: true, index: true }, // কোন মূল কোম্পানির আন্ডারে আছে (১২ ডিজিট)
  
  brandName: { type: String, required: true }, // যেমন: ফেসবুক শপ বা প্রহর ই-কমার্স নাম
  businessCategory: { type: String },
  businessMedium: { type: String }, // facebook, instagram, website ইত্যাদি
  
  // 🔹 এই নির্দিষ্ট ভার্চুয়াল আইডির নিজস্ব ব্যালেন্স লেজার
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

  status: { type: String, enum: ['PENDING', 'ACTIVE', 'BLOCKED'], default: 'ACTIVE', index: true },
  isDebitBlocked: { type: Boolean, default: false },
  isCreditBlocked: { type: Boolean, default: false },

  businessAddress: {
    division: String,
    district: String,
    upazila: String,
    holdingOrVillage: String
  },
  hasTradeLicense: { type: String, default: 'no' },
  tradeLicenseNumber: { type: String },
  tradeLicenseDoc: { type: String }

}, { timestamps: true, versionKey: false });

const VirtualAccount = mongoose.model('VirtualAccount', virtualAccountSchema);
export default VirtualAccount;
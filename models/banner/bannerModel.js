import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    url: { type: String, default: '', trim: true },
    placement: { type: String, required: true, uppercase: true, trim: true },

    accountType: {
      type: String,
      enum: ['ALL', 'PERSONAL', 'MERCHANT'],
      default: 'ALL',
      uppercase: true,
      trim: true
    },

    // একাধিক সাব-টাইপ সিলেক্ট করার জন্য (যেমন: ['MICRO', 'RETAIL'] অথবা ['ALL'])
    subTypes: {
      type: [String],
      default: ['ALL']
    },

    // সিঙ্গেল ভ্যালু সাপোর্ট / রেফারেন্সের জন্য
    subType: {
      type: String,
      default: 'ALL',
      uppercase: true,
      trim: true
    },

    priority: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
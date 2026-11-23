import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    url: { type: String, default: '', trim: true }, // অফার বা বিস্তারিত দেখার লিংক (ঐচ্ছিক)
    placement: { type: String, required: true, uppercase: true, trim: true }, // যেমন: HOME, WELCOME, SERVICE ইত্যাদি

    // কোন অ্যাকাউন্ট টাইপের জন্য ব্যানার (ALL / PERSONAL / MERCHANT)
    accountType: {
      type: String,
      enum: ['ALL', 'PERSONAL', 'MERCHANT'],
      default: 'ALL',
      uppercase: true,
      trim: true
    },

    // কোন সাব-ক্যাটাগরির জন্য ব্যানার (ALL / STANDARD / STUDENT / RESTRICTED / MICRO / RETAIL / ONLINE / CORPORATE)
    subType: {
      type: String,
      enum: [
        'ALL',
        'STANDARD',
        'STUDENT',
        'RESTRICTED',
        'MICRO',
        'RETAIL',
        'ONLINE',
        'CORPORATE'
      ],
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
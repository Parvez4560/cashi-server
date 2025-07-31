import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // কে এই ট্রানজেকশন করেছে
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer', // কোন গ্রাহকের জন্য হিসাব
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'], // credit = পাবে, debit = দিবে
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0, // amount কখনো নেগেটিভ হবে না (ইচ্ছা করলে যুক্ত করতে পারেন)
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
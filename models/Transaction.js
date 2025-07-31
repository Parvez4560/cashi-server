import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'], // আয় বা খরচ
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0, // amount কখনো নেগেটিভ হবে না (ইচ্ছা করলে রাখবেন)
    },
    category: {
      type: String,
      trim: true,
      default: '',
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

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;
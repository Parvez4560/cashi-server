import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  customerId: { type: String, required: true, index: true }, // মূল অ্যাকাউন্টের ১৬ ডিজিট আইডি
  walletId: { type: String, required: true, unique: true, index: true }, // আলাদা ওয়ালেট বা ব্যালেন্স কোড
  serviceName: { type: String, required: true }, // সার্ভিসের নাম (যেমন: Main Balance ইত্যাদি)
  balance: { type: Number, default: 0 },
  status: { type: String, default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

walletSchema.index({ customerId: 1, walletId: 1 });

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
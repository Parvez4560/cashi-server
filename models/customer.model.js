import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  note: { type: String },
  date: { type: Date, default: Date.now }
});

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  balance: { type: Number, default: 0 },
  transactions: [transactionSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // ✅ Added userId
});

export default mongoose.model('Customer', customerSchema);
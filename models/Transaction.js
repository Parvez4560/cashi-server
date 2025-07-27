 
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
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
  },
  category: String,
  note: String,
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
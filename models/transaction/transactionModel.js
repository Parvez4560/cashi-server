import mongoose from 'mongoose';

const partyBalanceSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
      trim: true,
    },
    virtualId: {
      type: String,
      required: true,
      trim: true,
    },
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const sourceSchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    account: {
      type: String,
      trim: true,
      default: null,
    },
    trxId: {
      type: String,
      trim: true,
      default: null,
    },
    gatewayRef: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    transactionType: {
      type: String,
      required: true,
      enum: ['ADD_MONEY', 'SEND_MONEY', 'CASH_OUT', 'PAYMENT', 'MOBILE_RECHARGE', 'REFUND'],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REVERSED'],
      default: 'PENDING',
      index: true,
    },
    isCancelled: {
      type: Boolean,
      default: false,
      index: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'BDT',
      trim: true,
      uppercase: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    sender: {
      type: partyBalanceSchema,
      default: null,
    },
    receiver: {
      type: partyBalanceSchema,
      default: null,
    },
    source: {
      type: sourceSchema,
      default: null,
    },
    reversalTransactionId: {
      type: String,
      trim: true,
    },
    cancelReason: {
      type: String,
      trim: true,
    },
    cancelledAt: {
      type: Date,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    minimize: true,
  }
);

transactionSchema.index(
  { 'source.channel': 1, 'source.trxId': 1 },
  {
    unique: true,
    partialFilterExpression: {
      'source.trxId': { $type: 'string', $ne: '' },
    },
  }
);

transactionSchema.index({ 'receiver.accountId': 1, createdAt: -1 });
transactionSchema.index({ 'sender.accountId': 1, createdAt: -1 });

const Transaction =
  mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction;
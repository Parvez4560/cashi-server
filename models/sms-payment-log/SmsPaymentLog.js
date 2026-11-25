import mongoose from "mongoose";

const smsPaymentLogSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["BKASH", "NAGAD", "ROCKET", "OTHER"],
      required: true,
      uppercase: true,
      trim: true,
    },
    sender: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    trxId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    customerPhone: {
      type: String,
      default: null,
      trim: true,
    },
    reference: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    rawSms: {
      type: String,
      required: true,
      trim: true,
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["UNUSED", "USED", "FLAGGED"],
      default: "UNUSED",
      index: true,
    },
    usedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

smsPaymentLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("SmsPaymentLog", smsPaymentLogSchema);
import mongoose from 'mongoose';

const smsQueueSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true, index: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'SENT'], default: 'PENDING', index: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // ১০ মিনিট পর অটো ডিলিট
}, {
  versionKey: false
});

const SmsQueue = mongoose.model('SmsQueue', smsQueueSchema);
export default SmsQueue;
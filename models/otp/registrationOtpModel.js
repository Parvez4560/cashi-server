import mongoose from 'mongoose';

const registrationOtpSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  token: { type: String, default: null }, // ওটিপি ভেরিফাই হওয়ার পর ১০ মিনিটের JWT টোকেন
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 600 } // ১০ মিনিট পর ডাটাবেজ থেকে অটো ডিলিট
}, {
  versionKey: false
});

const RegistrationOtp = mongoose.model('RegistrationOtp', registrationOtpSchema);
export default RegistrationOtp;
import mongoose from 'mongoose';

const registrationOtpSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  token: { type: String, default: null }, // ওটিপি মিলে যাওয়ার পর ১০ মিনিটের জন্য টোকেন
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 600 } // ১০ মিনিট পর ডাটাবেজ থেকে অটো ডিলিট হয়ে যাবে
}, {
  versionKey: false
});

const RegistrationOtp = mongoose.model('RegistrationOtp', registrationOtpSchema);
export default RegistrationOtp;
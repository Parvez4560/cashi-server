const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: '', trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    email: { type: String, default: '', trim: true, lowercase: true },
    fatherName: { type: String, default: '', trim: true },
    motherName: { type: String, default: '', trim: true },
    businessName: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    profileImage: { type: String, default: '' }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// **এই লাইনটা খুব গুরুত্বপূর্ণ**
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
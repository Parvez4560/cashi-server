import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    phone: { type: String, required: true, unique: true, trim: true },
    password: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 4, // PIN 4 digits
      validate: {
        validator: (v) => /^\d{4}$/.test(v),
        message: "Password must be exactly 4 digits",
      },
    },
    email: { type: String, trim: true, lowercase: true, default: "" },
    fatherName: { type: String, trim: true, default: "" },
    motherName: { type: String, trim: true, default: "" },
    businessName: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    profileImage: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ Password Hash (only if modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Password Match
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
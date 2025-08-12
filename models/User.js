import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: {
      type: String,
      required: true,
      //minlength: 4,
      //maxlength: 4, // ✅ PIN always 4 digits
      //validate: {
        //validator: function (v) {
          //return /^\d{4}$/.test(v); // ✅ Only digits allowed
        //},
        //message: "Password must be exactly 4 digits",
      //},
    },
    email: { type: String, default: "", trim: true, lowercase: true },
    fatherName: { type: String, default: "", trim: true },
    motherName: { type: String, default: "", trim: true },
    businessName: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    profileImage: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Default export
const User = mongoose.model("User", userSchema);
export default User;
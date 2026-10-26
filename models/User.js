import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  pin: { type: String, required: true }, // পিন বা পাসওয়ার্ডের হ্যাশ
  accountType: { 
    type: String, 
    enum: ["personal", "merchant"], 
    required: true 
  },
  subCategory: { 
    type: String, 
    // পার্সোনাল হলে: "standard", "student" ইত্যাদি
    // মার্চেন্ট হলে: "retail", "e-commerce", "corporate", "agent" ইত্যাদি
    default: "standard" 
  },
  businessName: { type: String }, // শুধুমাত্র মার্চেন্টদের জন্য প্রযোজ্য হতে পারে
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ["active", "suspended", "pending"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
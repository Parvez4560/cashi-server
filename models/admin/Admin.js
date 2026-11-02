import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  allowedDeviceTokens: [
    {
      deviceName: { type: String }, // যেমন: "V2419" বা "Mobile"
      deviceToken: { type: String } // UUID বেসড সিক্রেট ডিভাইস টোকেন
    }
  ] // রেজিস্টার্ড ডিভাইসের তালিকা (এখানে সর্বোচ্চ ১ বা ইচ্ছেমতো লিমিট রাখতে পারবেন)
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;
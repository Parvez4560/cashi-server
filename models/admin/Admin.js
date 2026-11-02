import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  allowedDeviceTokens: [
    {
      deviceName: { type: String }, // যেমন: "Computer" বা "Mobile"
      deviceToken: { type: String }
    }
  ] // কম্পিউটার ও মোবাইলের টোকেন এখানে জমা থাকবে (সর্বোচ্চ ২টি)
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;
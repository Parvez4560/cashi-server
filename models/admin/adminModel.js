import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // যেমন: "Super Admin" বা "SMS Operator"
    },
    role: {
      type: String,
      enum: ["super_admin", "sms_operator", "moderator", "support"],
      default: "super_admin",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    // অ্যাডমিনের নিজস্ব কাজের টোকেন (SMS gateway, webhook, automation ইত্যাদি কাজের জন্য)
    serviceTokens: [
      {
        label: { type: String, required: true }, // যেমন: "SMS Gateway Token", "Report Bot Token"
        tokenHash: { type: String, required: true }, // সিকিউরিটির জন্য হ্যাশ বা ইউনিক টোকেন রেফারেন্স
        tokenPrefix: { type: String }, // যেমন: "adm_sms_9f2a" (শনাক্ত করার সুবিধার্থে)
        scopes: [
          {
            type: String, // যেমন: "sms:send", "sms:read", "otp:manage", "reports:read"
          },
        ],
        isActive: { type: Boolean, default: true },
        expiresAt: { type: Date, default: null }, // null মানে মেয়াদহীন (বা প্রয়োজনমতো expiry দিন)
        lastUsedAt: { type: Date, default: null },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // রেজিস্টার্ড ডিভাইসের তালিকা (প্রতিটি ডিভাইসের আলাদা নাম ও ডিভাইস টোকেন)
    allowedDeviceTokens: [
      {
        deviceName: { type: String, required: true }, // যেমন: "V2419" বা "Office PC"
        deviceLabel: { type: String }, // অতিরিক্ত আলাদা নাম/নোট, যেমন: "SMS Relay Phone 1"
        deviceToken: { type: String, required: true }, // UUID বেসড সিক্রেট ডিভাইস টোকেন
        isActive: { type: Boolean, default: true },
        lastUsedAt: { type: Date, default: null },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;
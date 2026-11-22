import mongoose from "mongoose";

const accountServiceItemSchema = new mongoose.Schema(
  {
    serviceCode: { type: String, required: true },
    serviceName: { type: String, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "DEACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, default: "system" },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const accountServiceSchema = new mongoose.Schema(
  {
    accountId: { type: String, required: true, unique: true, index: true },
    accountType: { type: String, required: true },
    subtype: { type: String, default: "" },
    services: [accountServiceItemSchema],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const AccountService = mongoose.model("AccountService", accountServiceSchema);
export default AccountService;
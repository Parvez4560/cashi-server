import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    serviceCode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    allowedSender: [{ type: String }],
    allowedReceiver: [{ type: String }],
    status: {
      type: String,
      enum: ["ACTIVE", "DEACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;
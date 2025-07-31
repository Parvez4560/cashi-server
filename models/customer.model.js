import mongoose from "mongoose";

const customerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String },
    email: { type: String },
    image: { type: String }, // File URL
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Which user created it
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
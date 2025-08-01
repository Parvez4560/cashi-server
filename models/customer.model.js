import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    email: { type: String, default: "" },
    image: { type: String, default: "" }, // File URL
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // Which user created it
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
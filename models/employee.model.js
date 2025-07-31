import mongoose from "mongoose";

const employeeSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    salary: { type: Number, required: true },
    image: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
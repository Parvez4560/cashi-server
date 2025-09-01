import mongoose from "mongoose";

const upazilaSchema = new mongoose.Schema({
  countryCode: { type: String, required: true },
  divisionName: { type: String, required: true },
  districtName: { type: String, required: true },
  name: { type: String, required: true },
});

export default mongoose.model("Upazila", upazilaSchema);
import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
  countryCode: { type: String, required: true },
  divisionName: { type: String, required: true },
  name: { type: String, required: true },
});

export default mongoose.model("District", districtSchema);
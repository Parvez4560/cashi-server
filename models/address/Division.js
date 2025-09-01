import mongoose from "mongoose";

const divisionSchema = new mongoose.Schema({
  countryCode: { type: String, required: true },
  name: { type: String, required: true },
});

export default mongoose.model("Division", divisionSchema);
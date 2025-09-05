import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: false, unique: true },
}, { timestamps: true });

const divisionSchema = new mongoose.Schema({
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true },
  name: { type: String, required: true },
}, { timestamps: true });

const districtSchema = new mongoose.Schema({
  divisionId: { type: mongoose.Schema.Types.ObjectId, ref: "Division", required: true },
  name: { type: String, required: true },
}, { timestamps: true });

const upazilaSchema = new mongoose.Schema({
  districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District", required: true },
  name: { type: String, required: true },
}, { timestamps: true });

const unionSchema = new mongoose.Schema({
  upazilaId: { type: mongoose.Schema.Types.ObjectId, ref: "Upazila", required: true },
  name: { type: String, required: true },
}, { timestamps: true });

export const Country = mongoose.model("Country", countrySchema);
export const Division = mongoose.model("Division", divisionSchema);
export const District = mongoose.model("District", districtSchema);
export const Upazila = mongoose.model("Upazila", upazilaSchema);
export const Union = mongoose.model("Union", unionSchema);
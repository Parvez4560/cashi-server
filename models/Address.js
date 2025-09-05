const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }
}, { timestamps: true });

const divisionSchema = new mongoose.Schema({
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true },
  name: { type: String, required: true, trim: true }
}, { timestamps: true });

const districtSchema = new mongoose.Schema({
  divisionId: { type: mongoose.Schema.Types.ObjectId, ref: "Division", required: true },
  name: { type: String, required: true, trim: true }
}, { timestamps: true });

const upazilaSchema = new mongoose.Schema({
  districtId: { type: mongoose.Schema.Types.ObjectId, ref: "District", required: true },
  name: { type: String, required: true, trim: true }
}, { timestamps: true });

const unionSchema = new mongoose.Schema({
  upazilaId: { type: mongoose.Schema.Types.ObjectId, ref: "Upazila", required: true },
  name: { type: String, required: true, trim: true }
}, { timestamps: true });

const Country = mongoose.model("Country", countrySchema);
const Division = mongoose.model("Division", divisionSchema);
const District = mongoose.model("District", districtSchema);
const Upazila = mongoose.model("Upazila", upazilaSchema);
const Union = mongoose.model("Union", unionSchema);

module.exports = { Country, Division, District, Upazila, Union };
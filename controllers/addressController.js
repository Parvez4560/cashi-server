import Country from "../models/address/Country.js";
import Division from "../models/address/Division.js";
import District from "../models/address/District.js";
import Upazila from "../models/address/Upazila.js";
import Union from "../models/address/Union.js";

// সব দেশ
export const getCountries = async (req, res) => {
  try {
    const countries = await Country.find({});
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// divisions by country
export const getDivisions = async (req, res) => {
  const { countryCode } = req.params;
  try {
    const divisions = await Division.find({ countryCode });
    res.json(divisions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// districts by country + division
export const getDistricts = async (req, res) => {
  const { countryCode, divisionName } = req.params;
  try {
    const districts = await District.find({ countryCode, divisionName });
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// upazilas by country + division + district
export const getUpazilas = async (req, res) => {
  const { countryCode, divisionName, districtName } = req.params;
  try {
    const upazilas = await Upazila.find({ countryCode, divisionName, districtName });
    res.json(upazilas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// unions by country + division + district + upazila
export const getUnions = async (req, res) => {
  const { countryCode, divisionName, districtName, upazilaName } = req.params;
  try {
    const unions = await Union.find({ countryCode, divisionName, districtName, upazilaName });
    res.json(unions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
import { Country, Division, District, Upazila, Union } from "../models/addressModel.js";

// ==================== Fetch ====================
export const getCountries = async (req, res) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    res.json(countries);
  } catch (err) {
    res.status(500).json({ message: "Error fetching countries", error: err.message });
  }
};

export const getDivisions = async (req, res) => {
  try {
    const { countryId } = req.params;
    const divisions = await Division.find({ countryId }).sort({ name: 1 });
    res.json(divisions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching divisions", error: err.message });
  }
};

export const getDistricts = async (req, res) => {
  try {
    const { divisionId } = req.params;
    const districts = await District.find({ divisionId }).sort({ name: 1 });
    res.json(districts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching districts", error: err.message });
  }
};

export const getUpazilas = async (req, res) => {
  try {
    const { districtId } = req.params;
    const upazilas = await Upazila.find({ districtId }).sort({ name: 1 });
    res.json(upazilas);
  } catch (err) {
    res.status(500).json({ message: "Error fetching upazilas", error: err.message });
  }
};

export const getUnions = async (req, res) => {
  try {
    const { upazilaId } = req.params;
    const unions = await Union.find({ upazilaId }).sort({ name: 1 });
    res.json(unions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching unions", error: err.message });
  }
};

// ==================== Add ====================
export const addCountry = async (req, res) => {
  try {
    const { name, code } = req.body;
    const country = new Country({ name, code });
    await country.save();
    res.status(201).json(country);
  } catch (err) {
    res.status(500).json({ message: "Error adding country", error: err.message });
  }
};

export const addDivision = async (req, res) => {
  try {
    const { countryId, name } = req.body;
    const division = new Division({ countryId, name });
    await division.save();
    res.status(201).json(division);
  } catch (err) {
    res.status(500).json({ message: "Error adding division", error: err.message });
  }
};

export const addDistrict = async (req, res) => {
  try {
    const { divisionId, name } = req.body;
    const district = new District({ divisionId, name });
    await district.save();
    res.status(201).json(district);
  } catch (err) {
    res.status(500).json({ message: "Error adding district", error: err.message });
  }
};

export const addUpazila = async (req, res) => {
  try {
    const { districtId, name } = req.body;
    const upazila = new Upazila({ districtId, name });
    await upazila.save();
    res.status(201).json(upazila);
  } catch (err) {
    res.status(500).json({ message: "Error adding upazila", error: err.message });
  }
};

export const addUnion = async (req, res) => {
  try {
    const { upazilaId, name } = req.body;
    const union = new Union({ upazilaId, name });
    await union.save();
    res.status(201).json(union);
  } catch (err) {
    res.status(500).json({ message: "Error adding union", error: err.message });
  }
};

// ==================== Update ====================
export const updateCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    const updated = await Country.findByIdAndUpdate(id, { name, code }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating country", error: err.message });
  }
};

// একইভাবে Division/District/Upazila/Union
export const updateDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated = await Division.findByIdAndUpdate(id, { name }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating division", error: err.message });
  }
};

export const updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated = await District.findByIdAndUpdate(id, { name }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating district", error: err.message });
  }
};

export const updateUpazila = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated = await Upazila.findByIdAndUpdate(id, { name }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating upazila", error: err.message });
  }
};

export const updateUnion = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated = await Union.findByIdAndUpdate(id, { name }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating union", error: err.message });
  }
};

// ==================== Delete ====================
export const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;
    await Country.findByIdAndDelete(id);
    res.json({ message: "Country deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting country", error: err.message });
  }
};

export const deleteDivision = async (req, res) => {
  try {
    const { id } = req.params;
    await Division.findByIdAndDelete(id);
    res.json({ message: "Division deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting division", error: err.message });
  }
};

export const deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    await District.findByIdAndDelete(id);
    res.json({ message: "District deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting district", error: err.message });
  }
};

export const deleteUpazila = async (req, res) => {
  try {
    const { id } = req.params;
    await Upazila.findByIdAndDelete(id);
    res.json({ message: "Upazila deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting upazila", error: err.message });
  }
};

export const deleteUnion = async (req, res) => {
  try {
    const { id } = req.params;
    await Union.findByIdAndDelete(id);
    res.json({ message: "Union deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting union", error: err.message });
  }
};
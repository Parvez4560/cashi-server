const { Country, Division, District, Upazila, Union } = require("../models/Address");

// ------------------ Country ------------------
exports.addCountry = async (req, res) => {
  try {
    const country = await Country.create({ name: req.body.name });
    res.json({ success: true, data: country });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCountries = async (req, res) => {
  const countries = await Country.find().sort({ name: 1 });
  res.json({ success: true, data: countries });
};

exports.updateCountry = async (req, res) => {
  try {
    const country = await Country.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json({ success: true, data: country });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCountry = async (req, res) => {
  try {
    await Country.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Country deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ Division ------------------
exports.addDivision = async (req, res) => {
  try {
    const division = await Division.create({
      countryId: req.body.countryId,
      name: req.body.name
    });
    res.json({ success: true, data: division });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDivisions = async (req, res) => {
  const divisions = await Division.find({ countryId: req.query.countryId }).sort({ name: 1 });
  res.json({ success: true, data: divisions });
};

exports.updateDivision = async (req, res) => {
  try {
    const division = await Division.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json({ success: true, data: division });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDivision = async (req, res) => {
  try {
    await Division.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Division deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ District ------------------
exports.addDistrict = async (req, res) => {
  try {
    const district = await District.create({
      divisionId: req.body.divisionId,
      name: req.body.name
    });
    res.json({ success: true, data: district });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDistricts = async (req, res) => {
  const districts = await District.find({ divisionId: req.query.divisionId }).sort({ name: 1 });
  res.json({ success: true, data: districts });
};

exports.updateDistrict = async (req, res) => {
  try {
    const district = await District.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json({ success: true, data: district });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDistrict = async (req, res) => {
  try {
    await District.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "District deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ Upazila ------------------
exports.addUpazila = async (req, res) => {
  try {
    const upazila = await Upazila.create({
      districtId: req.body.districtId,
      name: req.body.name
    });
    res.json({ success: true, data: upazila });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUpazilas = async (req, res) => {
  const upazilas = await Upazila.find({ districtId: req.query.districtId }).sort({ name: 1 });
  res.json({ success: true, data: upazilas });
};

exports.updateUpazila = async (req, res) => {
  try {
    const upazila = await Upazila.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json({ success: true, data: upazila });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUpazila = async (req, res) => {
  try {
    await Upazila.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Upazila deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ Union ------------------
exports.addUnion = async (req, res) => {
  try {
    const union = await Union.create({
      upazilaId: req.body.upazilaId,
      name: req.body.name
    });
    res.json({ success: true, data: union });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUnions = async (req, res) => {
  const unions = await Union.find({ upazilaId: req.query.upazilaId }).sort({ name: 1 });
  res.json({ success: true, data: unions });
};

exports.updateUnion = async (req, res) => {
  try {
    const union = await Union.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json({ success: true, data: union });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUnion = async (req, res) => {
  try {
    await Union.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Union deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
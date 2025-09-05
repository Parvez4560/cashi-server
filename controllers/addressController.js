import db from "../config/db.js";

// ==================== Fetch Controllers ====================
export const getCountries = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, code FROM countries ORDER BY name ASC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching countries", error: error.message });
  }
};

export const getDivisions = async (req, res) => {
  try {
    const { countryId } = req.params;
    const [rows] = await db.query(
      "SELECT id, name FROM divisions WHERE country_id = ? ORDER BY name ASC",
      [countryId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching divisions", error: error.message });
  }
};

export const getDistricts = async (req, res) => {
  try {
    const { divisionId } = req.params;
    const [rows] = await db.query(
      "SELECT id, name FROM districts WHERE division_id = ? ORDER BY name ASC",
      [divisionId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching districts", error: error.message });
  }
};

export const getUpazilas = async (req, res) => {
  try {
    const { districtId } = req.params;
    const [rows] = await db.query(
      "SELECT id, name FROM upazilas WHERE district_id = ? ORDER BY name ASC",
      [districtId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching upazilas", error: error.message });
  }
};

export const getUnions = async (req, res) => {
  try {
    const { upazilaId } = req.params;
    const [rows] = await db.query(
      "SELECT id, name FROM unions WHERE upazila_id = ? ORDER BY name ASC",
      [upazilaId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching unions", error: error.message });
  }
};

// ==================== Bulk Add Controllers ====================
export const addCountries = async (req, res) => {
  try {
    const { countries } = req.body; // [{name, code}, ...]
    const values = countries.map(c => [c.name, c.code]);
    await db.query("INSERT INTO countries (name, code) VALUES ?", [values]);
    res.json({ message: "Countries added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding countries", error: error.message });
  }
};

export const addDivisions = async (req, res) => {
  try {
    const { countryId, divisions } = req.body; // [{name}, ...]
    const values = divisions.map(d => [countryId, d.name]);
    await db.query("INSERT INTO divisions (country_id, name) VALUES ?", [values]);
    res.json({ message: "Divisions added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding divisions", error: error.message });
  }
};

export const addDistricts = async (req, res) => {
  try {
    const { divisionId, districts } = req.body; // [{name}, ...]
    const values = districts.map(d => [divisionId, d.name]);
    await db.query("INSERT INTO districts (division_id, name) VALUES ?", [values]);
    res.json({ message: "Districts added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding districts", error: error.message });
  }
};

export const addUpazilas = async (req, res) => {
  try {
    const { districtId, upazilas } = req.body; // [{name}, ...]
    const values = upazilas.map(u => [districtId, u.name]);
    await db.query("INSERT INTO upazilas (district_id, name) VALUES ?", [values]);
    res.json({ message: "Upazilas added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding upazilas", error: error.message });
  }
};

export const addUnions = async (req, res) => {
  try {
    const { upazilaId, unions } = req.body; // [{name}, ...]
    const values = unions.map(u => [upazilaId, u.name]);
    await db.query("INSERT INTO unions (upazila_id, name) VALUES ?", [values]);
    res.json({ message: "Unions added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding unions", error: error.message });
  }
};

// ==================== Update Controllers ====================
export const updateCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    await db.query("UPDATE countries SET name=?, code=? WHERE id=?", [name, code, id]);
    res.json({ message: "Country updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating country", error: error.message });
  }
};

// অন্যান্য Update (Division, District, Upazila, Union) একই pattern
export const updateDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await db.query("UPDATE divisions SET name=? WHERE id=?", [name, id]);
    res.json({ message: "Division updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating division", error: error.message });
  }
};

export const updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await db.query("UPDATE districts SET name=? WHERE id=?", [name, id]);
    res.json({ message: "District updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating district", error: error.message });
  }
};

export const updateUpazila = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await db.query("UPDATE upazilas SET name=? WHERE id=?", [name, id]);
    res.json({ message: "Upazila updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating upazila", error: error.message });
  }
};

export const updateUnion = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await db.query("UPDATE unions SET name=? WHERE id=?", [name, id]);
    res.json({ message: "Union updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating union", error: error.message });
  }
};

// ==================== Delete Controllers ====================
export const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM countries WHERE id=?", [id]);
    res.json({ message: "Country deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting country", error: error.message });
  }
};

// অন্যান্য Delete (Division, District, Upazila, Union) একই pattern
export const deleteDivision = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM divisions WHERE id=?", [id]);
    res.json({ message: "Division deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting division", error: error.message });
  }
};

export const deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM districts WHERE id=?", [id]);
    res.json({ message: "District deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting district", error: error.message });
  }
};

export const deleteUpazila = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM upazilas WHERE id=?", [id]);
    res.json({ message: "Upazila deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting upazila", error: error.message });
  }
};

export const deleteUnion = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM unions WHERE id=?", [id]);
    res.json({ message: "Union deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting union", error: error.message });
  }
};
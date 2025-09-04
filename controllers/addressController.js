import db from "../config/db.js"; // আপনার DB connection ফাইল

// Country List
export const getCountries = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, code FROM countries ORDER BY name ASC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching countries", error: error.message });
  }
};

// Division List (by countryId)
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

// District List (by divisionId)
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

// Upazila List (by districtId)
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

// Union List (by upazilaId)
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
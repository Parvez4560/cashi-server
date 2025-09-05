import express from "express";
import {
  getCountries,
  getDivisions,
  getDistricts,
  getUpazilas,
  getUnions,
  addCountries,
  addDivisions,
  addDistricts,
  addUpazilas,
  addUnions,
  updateCountry,
  updateDivision,
  updateDistrict,
  updateUpazila,
  updateUnion,
  deleteCountry,
  deleteDivision,
  deleteDistrict,
  deleteUpazila,
  deleteUnion,
} from "../controllers/addressController.js";

const router = express.Router();

// ==================== Fetch Routes ====================
router.get("/countries", getCountries);
router.get("/divisions/:countryId", getDivisions);
router.get("/districts/:divisionId", getDistricts);
router.get("/upazilas/:districtId", getUpazilas);
router.get("/unions/:upazilaId", getUnions);

// ==================== Add / Bulk Add Routes ====================
router.post("/countries", addCountries);
router.post("/divisions", addDivisions);
router.post("/districts", addDistricts);
router.post("/upazilas", addUpazilas);
router.post("/unions", addUnions);

// ==================== Update Routes ====================
router.put("/countries/:id", updateCountry);
router.put("/divisions/:id", updateDivision);
router.put("/districts/:id", updateDistrict);
router.put("/upazilas/:id", updateUpazila);
router.put("/unions/:id", updateUnion);

// ==================== Delete Routes ====================
router.delete("/countries/:id", deleteCountry);
router.delete("/divisions/:id", deleteDivision);
router.delete("/districts/:id", deleteDistrict);
router.delete("/upazilas/:id", deleteUpazila);
router.delete("/unions/:id", deleteUnion);

export default router;
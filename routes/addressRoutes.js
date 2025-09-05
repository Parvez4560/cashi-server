import express from "express";
import {
  getCountries, getDivisions, getDistricts, getUpazilas, getUnions,
  addCountry, addDivision, addDistrict, addUpazila, addUnion,
  updateCountry, updateDivision, updateDistrict, updateUpazila, updateUnion,
  deleteCountry, deleteDivision, deleteDistrict, deleteUpazila, deleteUnion
} from "../controllers/addressController.js";

const router = express.Router();

// ==================== Fetch ====================
router.get("/countries", getCountries);
router.get("/divisions/:countryId", getDivisions);
router.get("/districts/:divisionId", getDistricts);
router.get("/upazilas/:districtId", getUpazilas);
router.get("/unions/:upazilaId", getUnions);

// ==================== Add ====================
router.post("/countries", addCountry);
router.post("/divisions", addDivision);
router.post("/districts", addDistrict);
router.post("/upazilas", addUpazila);
router.post("/unions", addUnion);

// ==================== Update ====================
router.put("/countries/:id", updateCountry);
router.put("/divisions/:id", updateDivision);
router.put("/districts/:id", updateDistrict);
router.put("/upazilas/:id", updateUpazila);
router.put("/unions/:id", updateUnion);

// ==================== Delete ====================
router.delete("/countries/:id", deleteCountry);
router.delete("/divisions/:id", deleteDivision);
router.delete("/districts/:id", deleteDistrict);
router.delete("/upazilas/:id", deleteUpazila);
router.delete("/unions/:id", deleteUnion);

export default router;
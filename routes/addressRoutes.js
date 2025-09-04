import express from "express";
import {
  getCountries,
  getDivisions,
  getDistricts,
  getUpazilas,
  getUnions,
} from "../controllers/addressController.js";

const router = express.Router();

// সব Country লিস্ট
router.get("/countries", getCountries);

// নির্দিষ্ট Country এর সব Division
router.get("/divisions/:countryId", getDivisions);

// নির্দিষ্ট Division এর সব District
router.get("/districts/:divisionId", getDistricts);

// নির্দিষ্ট District এর সব Upazila
router.get("/upazilas/:districtId", getUpazilas);

// নির্দিষ্ট Upazila এর সব Union
router.get("/unions/:upazilaId", getUnions);

export default router;
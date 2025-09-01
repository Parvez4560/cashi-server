import express from "express";
import {
  getCountries,
  getDivisions,
  getDistricts,
  getUpazilas,
  getUnions,
} from "../controllers/addressController.js";

const router = express.Router();

router.get("/countries", getCountries);
router.get("/divisions/:countryCode", getDivisions);
router.get("/districts/:countryCode/:divisionName", getDistricts);
router.get("/upazilas/:countryCode/:divisionName/:districtName", getUpazilas);
router.get("/unions/:countryCode/:divisionName/:districtName/:upazilaName", getUnions);

export default router;
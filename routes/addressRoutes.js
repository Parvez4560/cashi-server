const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

// Country
router.post("/country", addressController.addCountry);
router.get("/country", addressController.getCountries);
router.put("/country/:id", addressController.updateCountry);
router.delete("/country/:id", addressController.deleteCountry);

// Division
router.post("/division", addressController.addDivision);
router.get("/division", addressController.getDivisions);
router.put("/division/:id", addressController.updateDivision);
router.delete("/division/:id", addressController.deleteDivision);

// District
router.post("/district", addressController.addDistrict);
router.get("/district", addressController.getDistricts);
router.put("/district/:id", addressController.updateDistrict);
router.delete("/district/:id", addressController.deleteDistrict);

// Upazila
router.post("/upazila", addressController.addUpazila);
router.get("/upazila", addressController.getUpazilas);
router.put("/upazila/:id", addressController.updateUpazila);
router.delete("/upazila/:id", addressController.deleteUpazila);

// Union
router.post("/union", addressController.addUnion);
router.get("/union", addressController.getUnions);
router.put("/union/:id", addressController.updateUnion);
router.delete("/union/:id", addressController.deleteUnion);

module.exports = router;
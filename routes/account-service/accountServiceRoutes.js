import express from "express";
import { getAccountServices } from "../../controllers/account-service/accountServiceController.js"; // আপনার কন্ট্রোলারের সঠিক পাথ দিন

const router = express.Router();

// GET /api/account/services
router.get("/services", getAccountServices);

export default router;
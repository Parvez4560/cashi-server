import express from "express";
import multer from "multer";
import { createCustomer, getCustomers } from "../controllers/customer.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// File Upload Setup
const upload = multer({ dest: "uploads/" });

// POST /api/customers - Create customer with logged-in userId
router.post("/", protect, upload.single("image"), createCustomer);

// GET /api/customers - Get customers of logged-in user only
router.get("/", protect, getCustomers);

export default router;
import express from "express";
import multer from "multer";
import { createCustomer, getCustomers } from "../controllers/customer.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// File Upload Setup
const upload = multer({ dest: "uploads/" });

router.post("/", protect, upload.single("image"), createCustomer);
router.get("/", protect, getCustomers);

export default router;
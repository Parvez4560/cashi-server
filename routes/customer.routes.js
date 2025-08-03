import express from "express";
import multer from "multer";
import { createCustomer, getCustomers } from "../controllers/customer.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer storage setup with original filename preserved
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, `customer_${Date.now()}.${ext}`);
  }
});

const upload = multer({ storage });

// POST /api/customers - Create customer with logged-in userId
router.post("/", protect, upload.single("image"), createCustomer);

// GET /api/customers - Get customers of logged-in user only
router.get("/", protect, getCustomers);

export default router;
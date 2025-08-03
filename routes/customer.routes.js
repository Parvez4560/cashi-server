import express from "express";
import multer from "multer";
import { createCustomer, getCustomers } from "../controllers/customer.controller.js";
import { protect } from "../middleware/authMiddleware.js";  // <-- authMiddleware.js

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `customer_${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({ storage });

router.post("/", protect, upload.single("image"), createCustomer);
router.get("/", protect, getCustomers);

export default router;
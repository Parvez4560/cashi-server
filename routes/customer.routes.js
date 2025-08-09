import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createCustomer, getCustomers } from "../controllers/customer.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `customer_${uniqueSuffix}${ext}`);
  }
});

const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Console log দিয়ে দেখুন আসল mimetype কী আসছে
    console.log("Uploaded file mimetype:", file.mimetype);

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("সার্ভার শুধু ইমেজ ফাইল আপলোড সমর্থন করে (jpg, jpeg, png)।"));
    }
  }
});

router.post("/", protect, upload.single("image"), createCustomer);
router.get("/", protect, getCustomers);

export default router;
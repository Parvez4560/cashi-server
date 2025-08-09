import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createCustomer, getCustomers } from "../controllers/customer.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ensure uploads directory exists
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
    // Use path.extname to get proper extension including dot
    const ext = path.extname(file.originalname);
    cb(null, `customer_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Max file size 5MB (optional)
  },
  fileFilter: (req, file, cb) => {
    // Optional: accept only image files (jpg, jpeg, png)
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("সার্ভার শুধু ইমেজ ফাইল আপলোড সমর্থন করে (jpg, jpeg, png)।"));
    }
  }
});

router.post("/", protect, upload.single("image"), createCustomer);
router.get("/", protect, getCustomers);

export default router;
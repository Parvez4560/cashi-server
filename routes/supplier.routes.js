import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createSupplier, getSuppliers } from "../controllers/supplier.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const uploadDir = "uploads/suppliers";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `supplier_${uniqueSuffix}${ext}`);
  }
});

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
];
const allowedExts = [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (allowedMimeTypes.includes(mime) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("শুধুমাত্র JPEG, JPG, PNG, GIF, BMP অথবা WEBP ইমেজ ফাইল অনুমোদিত"));
    }
  },
});

router.post("/", protect, upload.single("image"), createSupplier);
router.get("/", protect, getSuppliers);

export default router;
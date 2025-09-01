import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createEmployee, getEmployees } from "../controllers/employee.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

const uploadDir = "uploads/employees";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `employee_${Date.now()}${ext}`);
  },
});

// Allowed mime types এবং extensions
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

    // mime বা extension যেকোনো একটাই মিলে গেলে true দিবে
    if (allowedMimeTypes.includes(mime) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("শুধুমাত্র JPEG, JPG, PNG, GIF, BMP অথবা WEBP ইমেজ ফাইল অনুমোদিত"));
    }
  },
});

router.post("/", protect, upload.single("image"), createEmployee);
router.get("/", protect, getEmployees);

export default router;
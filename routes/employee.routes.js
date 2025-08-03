import express from "express";
import multer from "multer";
import path from "path";
import { createEmployee, getEmployees } from "../controllers/employee.controller.js";
import { protect } from "../middleware/protect.js"; // ✅ নিশ্চিত হও protect.js middleware ফোল্ডারে আছে

const router = express.Router();

// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/employees"); // ✅ Employee images folder
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `employee_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("শুধুমাত্র JPEG, JPG, PNG বা WEBP ফাইল অনুমোদিত"));
    }
  },
});

// ✅ POST /api/employees - Create Employee
router.post("/", protect, upload.single("image"), createEmployee);

// ✅ GET /api/employees - Get All Employees for Logged-in User
router.get("/", protect, getEmployees);

export default router;
import express from "express";
import multer from "multer";
import path from "path";
import { createEmployee, getEmployees } from "../controllers/employee.controller.js";
import { protect } from "../middleware/authMiddleware.js";  // <-- authMiddleware.js

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/employees");
  },
  filename: (req, file, cb) => {
    cb(null, `employee_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
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

router.post("/", protect, upload.single("image"), createEmployee);
router.get("/", protect, getEmployees);

export default router;
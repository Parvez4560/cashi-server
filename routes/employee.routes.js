import express from "express";
import multer from "multer";
import { createEmployee, getEmployees } from "../controllers/employee.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST /api/employees - Create employee with logged-in userId
router.post("/", protect, upload.single("image"), createEmployee);

// GET /api/employees - Get employees of logged-in user only
router.get("/", protect, getEmployees);

export default router;
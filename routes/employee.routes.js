import express from "express";
import multer from "multer";
import { createEmployee, getEmployees } from "../controllers/employee.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", protect, upload.single("image"), createEmployee);
router.get("/", protect, getEmployees);

export default router;
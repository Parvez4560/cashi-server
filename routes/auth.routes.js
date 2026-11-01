import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import { cpUpload } from "../middleware/uploadMiddleware.js"; // যদি multer কনফিগারেশন আলাদা ফাইলে থাকে

const router = express.Router();

router.post("/login", loginUser);

router.post("/register", cpUpload, registerUser);

export default router;
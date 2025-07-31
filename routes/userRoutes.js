import express from "express";
import { registerUser, getUserProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ টোকেন চেক

const router = express.Router();

// ✅ রেজিস্ট্রেশন API
router.post("/register", registerUser);

// ✅ প্রোফাইল API (শুধু লগইন হলে)
router.get("/profile", protect, getUserProfile);

export default router; // ✅ ESM Export
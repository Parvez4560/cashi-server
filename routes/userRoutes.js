import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/user/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/user/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   GET /api/user/profile
 * @desc    Get logged-in user's profile
 * @access  Private
 */
router.get("/profile", protect, getUserProfile);

export default router;
import express from "express";
import { verifyAuth } from "../../middlewares/verifyAuth.js";
import {
  createAddMoneyToken,
  addMoney,
} from "../../controllers/transaction/addMoneyController.js";

const router = express.Router();

// অ্যাড মানিতে ঢোকার সময় Add-Money Token নেওয়া
router.post("/add-money/token", verifyAuth, createAddMoneyToken);

// Add-Money Token দিয়ে চূড়ান্ত ব্যালেন্স যোগ করা
router.post("/add-money", verifyAuth, addMoney);

export default router;
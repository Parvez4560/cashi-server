import express from "express";
import { protect } from "../middleware/authMiddleware.js";  // <-- authMiddleware.js
import {
  addTransaction,
  getUserTransactions,
  getCustomerTransactions,
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.post("/", protect, addTransaction);
router.get("/", protect, getUserTransactions);
router.get("/customer/:customerId", protect, getCustomerTransactions);

export default router;
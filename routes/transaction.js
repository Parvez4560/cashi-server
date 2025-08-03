import express from "express";
import Transaction from "../models/Transaction.js";
import { protect } from "../middleware/authMiddleware.js";  // নতুন auth middleware

const router = express.Router();

// ➡️ এখন Simple auth বাদ দিয়ে protect ব্যবহার করবেন

// ✅ Add Transaction
router.post("/add", protect, async (req, res) => {
  const { type, amount, category, note, date } = req.body;

  try {
    const transaction = new Transaction({
      user: req.user._id,  // protect middleware থেকে ইউজার অবজেক্ট আসবে
      type,
      amount,
      category,
      note,
      date,
    });

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get User Transactions
router.get("/my", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      date: -1,
    });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
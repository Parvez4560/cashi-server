import express from "express";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// ✅ Simple Auth Middleware (Demo)
const auth = (req, res, next) => {
  // Future: JWT validation যোগ হবে
  req.user = { id: req.headers["userid"] }; // Header এ userid পাঠাতে হবে
  next();
};

// ✅ Add Transaction
router.post("/add", auth, async (req, res) => {
  const { type, amount, category, note, date } = req.body;

  try {
    const transaction = new Transaction({
      user: req.user.id,
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
router.get("/my", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router; // ✅ অবশ্যই ESM এ এই লাইন থাকতে হবে
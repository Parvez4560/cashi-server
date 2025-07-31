import express from "express";

const router = express.Router();

// ✅ Sample route for accounting entries
router.get("/", (req, res) => {
  res.json({ message: "📒 Hisab records API is working!" });
});

export default router; // ✅ Default export for ESM
import express from "express";

const router = express.Router();

// ✅ Sample Stats API
router.get("/", (req, res) => {
res.json({ message: "📊 Stats API is working!" });
});

export default router; // ✅ Add this
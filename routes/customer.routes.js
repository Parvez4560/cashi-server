import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Customer route works!" });
});

export default router;
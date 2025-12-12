import express from "express";
import { translate } from "../utils/translator.js";

const router = express.Router();

router.post("/login", (req, res) => {
  const lang = req.headers["accept-language"] || "en";
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: translate(lang, "errors.invalid_request") });
  }

  // Dummy success response
  res.json({ message: translate(lang, "success.login") });
});

export default router;
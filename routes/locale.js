// routes/locale.js
import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/:lang", (req, res) => {
  const lang = req.params.lang || "en";
  const filePath = path.join(process.cwd(), "locales", `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(content);
  } else {
    res.status(404).json({ error: "Language not found" });
  }
});

export default router;
import express from "express";
import multer from "multer";
import { createSupplier, getSuppliers } from "../controllers/supplier.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer storage setup with original filename preserved and timestamp added
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, `supplier_${Date.now()}.${ext}`);
  }
});

const upload = multer({ storage });

router.post("/", protect, upload.single("image"), createSupplier);
router.get("/", protect, getSuppliers);

export default router;
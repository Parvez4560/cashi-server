import express from "express";
import multer from "multer";
import { createSupplier, getSuppliers } from "../controllers/supplier.controller.js";
import { protect } from "../middleware/authMiddleware.js";  // <-- এখানে authMiddleware.js থেকে ইম্পোর্ট

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `supplier_${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({ storage });

router.post("/", protect, upload.single("image"), createSupplier);
router.get("/", protect, getSuppliers);

export default router;
import express from "express";
import multer from "multer";
import { createSupplier, getSuppliers } from "../controllers/supplier.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", protect, upload.single("image"), createSupplier);
router.get("/", protect, getSuppliers);

export default router;
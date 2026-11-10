import express from "express";
import { adminLogin } from "../../controllers/admin/adminController.js";
// 🔹 নতুন তৈরি করা পেন্ডিং অ্যাকাউন্ট কন্ট্রোলার ইমপোর্ট করুন
import { 
  getPendingAccountsList, 
  updatePendingAccountStatus 
} from "../../controllers/admin/pending-account/pendingAccountController.js";

const router = express.Router();

// ১. এডমিন লগইন রুট (POST /admin/login)
router.post("/login", adminLogin);

// ২. পেন্ডিং অ্যাকাউন্ট লিস্ট দেখার রুট (GET /admin/pending-accounts)
router.get("/pending-accounts", getPendingAccountsList);

// ৩. পেন্ডিং অ্যাকাউন্ট স্ট্যাটাস আপডেট বা এপ্রুভ করার রুট (PUT /admin/update-account-status)
router.put("/update-account-status", updatePendingAccountStatus);

export default router;
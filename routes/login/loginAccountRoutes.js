import express from "express";
import { 
  sendLoginOtp, 
  verifyLoginOtp, 
  firstTimePinLogin, 
  quickPinLogin 
} from "../../controllers/login/loginAccountController.js";

const router = express.Router();

// নতুন বা অন্য ডিভাইস লগইন ফ্লো (ওটিপি ও পিন বাইন্ডিং সহ)
router.post("/send-otp", sendLoginOtp);
router.post("/verify-otp", verifyLoginOtp);
router.post("/verify-pin", firstTimePinLogin);

// বিশ্বস্ত ডিভাইস থেকে দ্রুত পিন লগইন ফ্লো (ওটিপি ছাড়া)
router.post("/quick-pin", quickPinLogin);

export default router;
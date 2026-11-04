import express from 'express';
import { sendRegistrationOtp, verifyRegistrationOtp } from '../../controllers/otp/registrationOtpController.js';

const router = express.Router();

// ওটিপি পাঠানোর রুট
router.post('/send-otp', sendRegistrationOtp);

// ওটিপি ভেরিফাই করার রুট
router.post('/verify-otp', verifyRegistrationOtp);

export default router;
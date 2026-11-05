import express from 'express';
import { sendRegistrationOtp, verifyRegistrationOtp } from '../../controllers/otp/registrationOtpController.js';

const router = express.Router();

router.post('/send-otp', sendRegistrationOtp);
router.post('/verify-otp', verifyRegistrationOtp);

export default router;
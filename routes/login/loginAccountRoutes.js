import express from 'express';
import {
  sendLoginOtp,
  verifyLoginOtp,
  firstTimePinLogin,
  setupNewPin,
  quickPinLogin
} from '../../controllers/login/loginAccountController.js';

const router = express.Router();

router.post('/send-otp', sendLoginOtp);
router.post('/verify-otp', verifyLoginOtp);
router.post('/verify-pin', firstTimePinLogin);
router.post('/setup-pin', setupNewPin);
router.post('/quick-pin', quickPinLogin);

export default router;
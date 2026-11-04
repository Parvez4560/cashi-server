import express from 'express';
import { getPendingSmsList, markSmsAsSent } from '../../controllers/sms/smsController.js';

const router = express.Router();

// অ্যান্ড্রয়েড অ্যাপ এই রাউটে GET রিকোয়েস্ট করবে (প্রতি ১০ সেকেন্ড পর পর)
router.get('/pending-sms', getPendingSmsList);

// এসএমএস পাঠানো শেষ হলে অ্যাপ এই রাউটে POST করে স্ট্যাটাস আপডেট করবে
router.post('/mark-sent', markSmsAsSent);

export default router;
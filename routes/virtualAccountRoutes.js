import express from 'express';
import { createVirtualService } from '../controllers/virtualAccountController.js';

const router = express.Router();

// নতুন ভার্চুয়াল আইডি বা ব্র্যান্ড তৈরি করার রাউট
router.post('/create-service', createVirtualService);

export default router;
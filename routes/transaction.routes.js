import express from 'express';
import { protect } from '../middleware/authMiddleware.js';  // ধরছি আপনার auth middleware এখানে আছে
import {
  addTransaction,
  getUserTransactions,
  getCustomerTransactions,
} from '../controllers/transaction.controller.js'; // আপনার ট্রানজেকশন কন্ট্রোলার

const router = express.Router();

// সমস্ত রাউট প্রটেক্টেড Middleware দিয়ে নিরাপদ করা হয়েছে
router.post('/', protect, addTransaction); // নতুন ট্রানজেকশন যোগ করা
router.get('/', protect, getUserTransactions); // ইউজারের সব ট্রানজেকশন
router.get('/customer/:customerId', protect, getCustomerTransactions); // নির্দিষ্ট গ্রাহকের ট্রানজেকশন

export default router;
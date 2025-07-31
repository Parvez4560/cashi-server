import express from 'express';
import { createCustomer, getCustomers } from '../controllers/customer.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Authenticated Routes
router.post('/', protect, createCustomer);
router.get('/', protect, getCustomers);

export default router;
import express from 'express';
import { createStore } from '../controllers/storeController.js';

const router = express.Router();

router.post('/create', createStore);

export default router;
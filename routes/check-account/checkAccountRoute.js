import express from 'express';
import { checkAccountController } from '../../controllers/check-account/checkAccountController.js';

const router = express.Router();

router.post('/check', checkAccountController);

export default router;
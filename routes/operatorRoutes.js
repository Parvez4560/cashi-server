import express from 'express';
import { operatorController } from '../controllers/operatorController.js';

const router = express.Router();

router.get('/', operatorController.getAllOperators);
router.post('/', operatorController.createOperator);
router.put('/:id', operatorController.updateOperator);
router.delete('/:id', operatorController.deleteOperator);

export default router;
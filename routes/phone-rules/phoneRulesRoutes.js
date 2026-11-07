import express from 'express';
import { getCountryRules } from '../../controllers/phone-rules/phoneRulesController.js';

const router = express.Router();

// GET /api/countries/rules -> সব দেশের রুলস
// GET /api/countries/rules?iso=BD -> নির্দিষ্ট দেশের রুলস
router.get('/rules', getCountryRules);

export default router;
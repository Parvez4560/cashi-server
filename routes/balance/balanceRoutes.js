import express from "express";
import { getWalletBalances } from "../../controllers/balance/balanceController.js";

const router = express.Router();

// GET /api/wallet/balances
router.get("/balances", getWalletBalances);

export default router;
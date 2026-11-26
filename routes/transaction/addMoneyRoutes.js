import express from "express";
import { verifyAuth } from "../../middlewares/verifyAuth.js";
import { addMoney } from "../../controllers/transaction/addMoneyController.js";

const router = express.Router();

router.post("/add-money", verifyAuth, addMoney);

export default router;
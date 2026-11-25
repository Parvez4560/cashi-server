import express from "express";
import { ingestSmsPayment } from "../../controllers/sms-ingest/smsIngestController.js";

const router = express.Router();

router.post("/ingest", ingestSmsPayment);

export default router;
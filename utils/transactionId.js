import crypto from "crypto";
import Transaction from "../models/transaction/transactionModel.js";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function createRandomCode(length = 10) {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARSET[bytes[i] % CHARSET.length];
  }
  return result;
}

export async function generateTransactionId(length = 10, maxAttempts = 5) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = createRandomCode(length);
    const exists = await Transaction.exists({ transactionId: candidate });
    if (!exists) {
      return candidate;
    }
  }
  throw new Error("FAILED_TO_GENERATE_UNIQUE_TRANSACTION_ID");
}
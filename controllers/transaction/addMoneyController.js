import mongoose from "mongoose";
import VirtualAccount from "../../models/VirtualAccount.js";
import Transaction from "../../models/transaction/transactionModel.js";
import { ADD_MONEY_SOURCE_RULES } from "../../config/addMoneySources.js";
import { generateTransactionId } from "../../utils/transactionId.js";

function sumCurrencyCodes(currencyMapOrObj) {
  if (!currencyMapOrObj) return 0;
  const entries =
    currencyMapOrObj instanceof Map
      ? Array.from(currencyMapOrObj.entries())
      : Object.entries(currencyMapOrObj);

  return entries.reduce((sum, [, val]) => sum + (Number(val) || 0), 0);
}

export const addMoney = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const accountId = req.auth?.accountId;
    if (!accountId) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
      });
    }

    const {
      virtualId,
      amount,
      currency = "BDT",
      source,
      idempotencyKey,
    } = req.body;

    const numericAmount = Number(amount);
    const formattedCurrency = String(currency).toUpperCase();
    const channelKey = String(source?.channel || "").toLowerCase().trim();
    const sourceRule = ADD_MONEY_SOURCE_RULES[channelKey];

    if (
      !virtualId ||
      !numericAmount ||
      numericAmount <= 0 ||
      !channelKey ||
      !sourceRule ||
      !sourceRule.enabled ||
      !idempotencyKey
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_REQUEST_OR_SOURCE",
      });
    }

    const existingByIdempotency = await Transaction.findOne({ idempotencyKey }).lean();
    if (existingByIdempotency) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        data: existingByIdempotency,
      });
    }

    const accountServiceDoc = await mongoose.connection
      .collection("accountservices")
      .findOne({ accountId });

    const addMoneyService = accountServiceDoc?.services?.find(
      (s) => s.serviceCode === "ADD_MONEY"
    );

    if (!addMoneyService || addMoneyService.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        code: "SERVICE_NOT_ALLOWED",
      });
    }

    let createdTransaction;

    await session.withTransaction(async () => {
      const virtualAccount = await VirtualAccount.findOne({
        virtualId,
        accountId,
      }).session(session);

      if (!virtualAccount) {
        const err = new Error("VIRTUAL_ACCOUNT_NOT_FOUND");
        err.statusCode = 404;
        throw err;
      }

      if (virtualAccount.status !== "ACTIVE" || virtualAccount.isCreditBlocked) {
        const err = new Error("CREDIT_BLOCKED");
        err.statusCode = 403;
        throw err;
      }

      if (!virtualAccount.balances) {
        virtualAccount.balances = new Map();
      }
      if (!virtualAccount.balances.get(formattedCurrency)) {
        virtualAccount.balances.set(formattedCurrency, new Map());
      }

      const currencyMap = virtualAccount.balances.get(formattedCurrency);
      const balanceBefore = sumCurrencyCodes(currencyMap);

      const creditCode = String(sourceRule.creditCode);
      const currentCreditVal = Number(currencyMap.get(creditCode) || 0);
      currencyMap.set(creditCode, currentCreditVal + numericAmount);

      const balanceAfter = sumCurrencyCodes(currencyMap);

      await virtualAccount.save({ session });

      const transactionId = await generateTransactionId();

      const [txDoc] = await Transaction.create(
        [
          {
            transactionId,
            transactionType: "ADD_MONEY",
            status: "SUCCESS",
            isCancelled: false,
            currency: formattedCurrency,
            amount: numericAmount,
            sender: null,
            receiver: {
              accountId,
              virtualId: virtualAccount.virtualId,
              fee: 0,
              netAmount: numericAmount,
              balanceBefore,
              balanceAfter,
            },
            source: {
              channel: channelKey,
              account: source.account || null,
              trxId: source.trxId || null,
              gatewayRef: source.gatewayRef || null,
            },
            idempotencyKey,
          },
        ],
        { session }
      );

      createdTransaction = txDoc;
    });

    return res.status(201).json({
      success: true,
      data: createdTransaction,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        code: "DUPLICATE_TRANSACTION",
      });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        code: error.message,
      });
    }

    console.error("Add Money Error:", error);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
    });
  } finally {
    await session.endSession();
  }
};
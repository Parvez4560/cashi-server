import crypto from "crypto";
import Admin from "../../models/admin/adminModel.js";
import SmsPaymentLog from "../../models/sms-payment-log/SmsPaymentLog.js";

// শুধু অনুমোদিত Sender / Provider তালিকা
const ALLOWED_RULES = {
  BKASH: {
    senders: ["BKASH", "16247"],
    keywords: ["TRXID", "RECEIVED", "CASH IN", "PAYMENT", "TK", "BDT"],
  },
  NAGAD: {
    senders: ["NAGAD", "16167"],
    keywords: ["TXNID", "TRXID", "RECEIVED", "BDT", "TK"],
  },
  ROCKET: {
    senders: ["16216", "ROCKET", "DBBL"],
    keywords: ["TXNID", "TRXID", "RECEIVED", "BDT", "TK"],
  },
};

const MAX_SKEW_MS = 2 * 60 * 1000;

const seenNonces = new Map();

function cleanExpiredNonces() {
  const now = Date.now();
  for (const [nonce, expiresAt] of seenNonces.entries()) {
    if (expiresAt <= now) {
      seenNonces.delete(nonce);
    }
  }
}

function isAllowedSender(provider, sender) {
  const rule = ALLOWED_RULES[provider];
  if (!rule) return false;

  const normalizedSender = String(sender || "").trim().toUpperCase();
  if (!normalizedSender) return false;

  return rule.senders.some((allowed) => {
    const target = allowed.toUpperCase();
    return normalizedSender === target || normalizedSender.includes(target);
  });
}

// DD/MM/YYYY HH:mm (যেমন: 25/11/2026 11:55 বা 25/11/2026 18:10) পার্স করা
function parseSmsDateTime(dateStr, timeStr) {
  if (!dateStr) return null;

  const parts = dateStr.split("/").map((v) => Number(v));
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;
  if (!day || !month || !year) return null;

  let hour = 0;
  let minute = 0;
  if (timeStr) {
    const tParts = timeStr.split(":").map((v) => Number(v));
    hour = Number.isFinite(tParts[0]) ? tParts[0] : 0;
    minute = Number.isFinite(tParts[1]) ? tParts[1] : 0;
  }

  // Bangladesh Standard Time (UTC+6) অনুযায়ী ISO Date তৈরি
  const isoString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+06:00`;

  const parsedDate = new Date(isoString);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function parsePaymentSms(provider, rawSms) {
  const text = String(rawSms || "").trim();
  const upperText = text.toUpperCase();

  const rule = ALLOWED_RULES[provider];
  if (!rule) return null;

  const hasKeyword = rule.keywords.some((kw) => upperText.includes(kw));
  if (!hasKeyword) return null;

  // 1. Amount বের করা (Balance Tk যেন না আসে, তাই payment/received/cash in/bdt/tk এর কাছাকাছি প্রথম অ্যামাউন্ট)
  const amountMatch =
    text.match(/(?:PAYMENT|RECEIVED|CASH\s*IN)\s+(?:OF\s+)?(?:TK|BDT)\s*([\d,]+(?:\.\d{1,2})?)/i) ||
    text.match(/(?:TK|BDT)\s*([\d,]+(?:\.\d{1,2})?)/i) ||
    text.match(/([\d,]+(?:\.\d{1,2})?)\s*(?:TK|BDT)/i);

  if (!amountMatch) return null;
  const amount = Number(amountMatch[1].replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return null;

  // 2. মোবাইল নম্বর বা ব্যাংক/কার্ড/অ্যাকাউন্ট নম্বর ("from ..." এর পরের অংশ)
  const fromMatch = text.match(/\bfrom\s+([A-Z0-9X*_-]+)/i);
  const accountOrPhone = fromMatch ? fromMatch[1].trim() : null;

  const plainPhoneMatch = accountOrPhone
    ? accountOrPhone.match(/^(?:\+?88)?(01[3-9]\d{8})$/)
    : null;
  const customerPhone = plainPhoneMatch ? plainPhoneMatch[1] : accountOrPhone;

  // 3. TrxID / TxnID বের করা
  const trxMatch = text.match(/\b(?:TRXID|TXNID)\s*[:\-]?\s*([A-Z0-9]{6,25})\b/i);
  if (!trxMatch) return null;
  const trxId = trxMatch[1].toUpperCase();

  // 4. মেসেজের ভেতরের Time ও Date বের করা (যেমন: at 25/11/2026 11:55)
  const dateTimeMatch = text.match(/\bat\s+(\d{1,2}\/\d{1,2}\/\d{4})(?:\s+(\d{1,2}:\d{2}))?/i);
  const messageDateText = dateTimeMatch
    ? `${dateTimeMatch[1]}${dateTimeMatch[2] ? ` ${dateTimeMatch[2]}` : ""}`
    : null;
  const messageTime = dateTimeMatch
    ? parseSmsDateTime(dateTimeMatch[1], dateTimeMatch[2])
    : null;

  // 5. Reference (যদি মেসেজে থাকে)
  const refMatch = text.match(/\b(?:REF|REFERENCE)\s*[:\-]?\s*([A-Z0-9_-]{2,30})\b/i);
  const reference = refMatch ? refMatch[1].toUpperCase() : null;

  return {
    amount,
    customerPhone,
    trxId,
    messageTime,
    messageDateText,
    reference,
  };
}

async function verifyGatewayAuth(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : String(req.headers["x-service-token"] || req.headers["x-gateway-token"] || "").trim();

  const timestampHeader = String(req.headers["x-timestamp"] || "").trim();
  const nonce = String(req.headers["x-nonce"] || "").trim();
  const signature = String(req.headers["x-signature"] || "").trim();

  if (!token || !timestampHeader || !nonce || !signature) {
    return { ok: false, reason: "Missing authentication headers" };
  }

  const ts = Number(timestampHeader);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_SKEW_MS) {
    return { ok: false, reason: "Expired or invalid timestamp" };
  }

  cleanExpiredNonces();
  if (seenNonces.has(nonce)) {
    return { ok: false, reason: "Duplicate nonce detected" };
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const admin = await Admin.findOne({
    serviceTokens: {
      $elemMatch: {
        tokenHash,
        isActive: true,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      },
    },
  }).lean();

  if (!admin) {
    return { ok: false, reason: "Invalid or inactive service token" };
  }

  const payloadString = `${timestampHeader}.${nonce}.${JSON.stringify(req.body || {})}`;
  const expectedSig = crypto
    .createHmac("sha256", token)
    .update(payloadString)
    .digest("hex");

  const sigBuf = Buffer.from(signature);
  const expectedSigBuf = Buffer.from(expectedSig);

  if (
    sigBuf.length !== expectedSigBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedSigBuf)
  ) {
    return { ok: false, reason: "Invalid signature" };
  }

  seenNonces.set(nonce, Date.now() + MAX_SKEW_MS);

  await Admin.updateOne(
    { _id: admin._id, "serviceTokens.tokenHash": tokenHash },
    { $set: { "serviceTokens.$.lastUsedAt": new Date() } }
  );

  return { ok: true, adminId: admin._id };
}

export async function ingestSmsPayment(req, res) {
  try {
    const auth = await verifyGatewayAuth(req);
    if (!auth.ok) {
      return res.status(401).json({
        success: false,
        message: auth.reason,
      });
    }

    const provider = String(req.body?.provider || "").trim().toUpperCase();
    const sender = String(req.body?.sender || "").trim();
    const rawSms = String(req.body?.rawSms || "").trim();
    const deviceId = String(req.body?.deviceId || "").trim();

    if (!provider || !sender || !rawSms || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "provider, sender, rawSms, and deviceId are required",
      });
    }

    if (!isAllowedSender(provider, sender)) {
      return res.status(403).json({
        success: false,
        message: "Sender or provider is not allowed",
      });
    }

    const parsed = parsePaymentSms(provider, rawSms);
    if (!parsed) {
      return res.status(422).json({
        success: false,
        message: "SMS did not match valid payment pattern",
      });
    }

    const existing = await SmsPaymentLog.findOne({ trxId: parsed.trxId }).lean();
    if (existing) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        message: "TrxID already recorded",
        data: {
          trxId: existing.trxId,
          status: existing.status,
        },
      });
    }

    const created = await SmsPaymentLog.create({
      adminId: auth.adminId,
      provider,
      sender,
      trxId: parsed.trxId,
      amount: parsed.amount,
      customerPhone: req.body?.customerPhone || parsed.customerPhone,
      reference: req.body?.reference || parsed.reference,
      messageTime: parsed.messageTime,
      rawSms,
      deviceId,
      status: "UNUSED",
      expiresAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "Payment SMS stored successfully",
      data: {
        id: created._id,
        provider: created.provider,
        trxId: created.trxId,
        amount: created.amount,
        customerPhone: created.customerPhone,
        reference: created.reference,
        messageTime: created.messageTime,
        messageDateText: parsed.messageDateText,
        status: created.status,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        message: "Duplicate TrxID ignored",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to store SMS payment",
    });
  }
}
import { validateService } from "./serviceValidator.js";
import { calculateCharge, CHARGE_CODES } from "../utils/chargeEngine.js";

export const SERVICE_CHARGE_RULES = {
  ADD_MONEY: {
    bkash: {
      enabled: true,
      chargeConfig: {
        chargeCode: CHARGE_CODES.PERCENT_MIN_MAX, // 103
        value: 1.5,
        min: 5,
        max: 10,
        roundMode: "ROUND",
      },
    },
    bank: {
      enabled: true,
      chargeConfig: {
        chargeCode: CHARGE_CODES.FREE, // 100
      },
    },
  },
};

export async function getChargeByService({
  serviceCode,
  channel,
  amount,
  senderType = null,
  receiverType = null,
  allowPendingOnInactive = false,
}) {
  const serviceDoc = await validateService({
    serviceCode,
    senderType,
    receiverType,
    allowPendingOnInactive,
  });

  const channelKey = String(channel || "").trim().toLowerCase();
  const rule = SERVICE_CHARGE_RULES[serviceDoc.serviceCode]?.[channelKey];

  if (!rule || !rule.enabled) {
    throw new Error("CHANNEL_NOT_SUPPORTED");
  }

  // সার্ভিস ACTIVE না থাকলে পেমেন্ট এলে ব্যালেন্সে না ঢুকিয়ে PENDING-এ রাখা হবে
  if (!serviceDoc.isActive) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error("INVALID_AMOUNT");
    }

    return {
      serviceId: serviceDoc._id,
      serviceCode: serviceDoc.serviceCode,
      serviceName: serviceDoc.name,
      channel: channelKey,
      isServiceActive: false,
      shouldHoldAsPending: true,
      holdReason: serviceDoc.holdReason,
      chargeCode: CHARGE_CODES.FREE,
      amount: numericAmount,
      fee: 0,
      netAmount: 0,
    };
  }

  const charge = calculateCharge({
    amount,
    ...rule.chargeConfig,
  });

  return {
    serviceId: serviceDoc._id,
    serviceCode: serviceDoc.serviceCode,
    serviceName: serviceDoc.name,
    channel: channelKey,
    isServiceActive: true,
    shouldHoldAsPending: false,
    holdReason: null,
    ...charge,
  };
}
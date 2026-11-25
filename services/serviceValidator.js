import Service from "../models/Service.js";

export async function validateService({
  serviceCode,
  senderType = null,
  receiverType = null,
  allowPendingOnInactive = false,
}) {
  const code = String(serviceCode || "").trim().toUpperCase();
  if (!code) {
    throw new Error("SERVICE_CODE_REQUIRED");
  }

  const service = await Service.findOne({ serviceCode: code }).lean();
  if (!service) {
    throw new Error("SERVICE_NOT_FOUND");
  }

  const isActive = service.status === "ACTIVE";

  if (!isActive && !allowPendingOnInactive) {
    throw new Error("SERVICE_INACTIVE");
  }

  if (
    senderType &&
    Array.isArray(service.allowedSender) &&
    service.allowedSender.length > 0
  ) {
    const normalizedSender = String(senderType).trim().toUpperCase();
    if (!service.allowedSender.includes(normalizedSender)) {
      throw new Error("SENDER_NOT_ALLOWED_FOR_SERVICE");
    }
  }

  if (
    receiverType &&
    Array.isArray(service.allowedReceiver) &&
    service.allowedReceiver.length > 0
  ) {
    const normalizedReceiver = String(receiverType).trim().toUpperCase();
    if (!service.allowedReceiver.includes(normalizedReceiver)) {
      throw new Error("RECEIVER_NOT_ALLOWED_FOR_SERVICE");
    }
  }

  return {
    ...service,
    isActive,
    holdReason: isActive ? null : `SERVICE_${service.status}`,
  };
}
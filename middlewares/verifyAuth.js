import jwt from "jsonwebtoken";
import Account from "../models/Account.js";

export async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        code: "ACCESS_TOKEN_REQUIRED",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Account.findOne({ accountId: decoded.accountId }).lean();
    if (!user || user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_NOT_ACTIVE",
      });
    }

    const deviceToken = user.trustedDevice?.deviceToken || null;
    if (!deviceToken) {
      return res.status(403).json({
        success: false,
        code: "TRUSTED_DEVICE_NOT_FOUND",
      });
    }

    const incomingDeviceToken = String(
      req.headers["x-device-token"] || req.body?.deviceToken || ""
    ).trim();

    if (!incomingDeviceToken) {
      return res.status(401).json({
        success: false,
        code: "DEVICE_TOKEN_REQUIRED",
      });
    }

    if (incomingDeviceToken !== deviceToken) {
      return res.status(403).json({
        success: false,
        code: "DEVICE_TOKEN_MISMATCH",
      });
    }

    req.user = user;
    req.auth = {
      accountId: user.accountId,
      mobileNumber: user.mobileNumber,
      accountType: decoded.accountType || user.accountType,
      defaultVirtualId: user.defaultVirtualId,
      deviceToken,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      code:
        error.name === "TokenExpiredError"
          ? "ACCESS_TOKEN_EXPIRED"
          : "INVALID_ACCESS_TOKEN",
    });
  }
}
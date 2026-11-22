import jwt from "jsonwebtoken";
import Account from "../../models/Account.js";
import Service from "../../models/Service.js";
import AccountService from "../../models/account-service/accountServiceModel.js";

export const getAccountServices = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const deviceToken = req.headers["x-device-token"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
      });
    }

    if (!deviceToken || typeof deviceToken !== "string" || !deviceToken.trim()) {
      return res.status(401).json({
        success: false,
        code: "DEVICE_TOKEN_REQUIRED",
      });
    }

    const accessToken = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

    let decoded;
    try {
      decoded = jwt.verify(accessToken, jwtSecret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        code: "INVALID_OR_EXPIRED_TOKEN",
      });
    }

    const accountId = decoded.accountId || decoded.id;
    if (!accountId) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN_PAYLOAD",
      });
    }

    const account = await Account.findOne({ accountId })
      .select("accountId status ownerName trustedDevice")
      .lean();

    if (!account) {
      return res.status(404).json({
        success: false,
        code: "ACCOUNT_NOT_FOUND",
      });
    }

    if (account.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_INACTIVE",
      });
    }

    const registeredDeviceToken = account.trustedDevice?.deviceToken;
    if (!registeredDeviceToken || registeredDeviceToken !== deviceToken.trim()) {
      return res.status(403).json({
        success: false,
        code: "UNTRUSTED_DEVICE",
      });
    }

    const [globalServices, accountDoc] = await Promise.all([
      Service.find({}).select("_id serviceCode name status").sort({ _id: 1 }).lean(),
      AccountService.findOne({ accountId: account.accountId }).lean(),
    ]);

    if (!accountDoc) {
      return res.status(404).json({
        success: false,
        code: "ACCOUNT_SERVICES_NOT_FOUND",
      });
    }

    const accountServiceMap = new Map(
      (accountDoc.services || []).map((srv) => [srv.serviceCode, srv])
    );

    const formattedServices = globalServices.map((gSrv, index) => {
      const accSrv = accountServiceMap.get(gSrv.serviceCode);

      const serviceStatus = gSrv.status || "DEACTIVE";
      const accountServiceStatus = accSrv?.status || "DEACTIVE";
      const isAvailable =
        String(serviceStatus).toUpperCase() === "ACTIVE" &&
        String(accountServiceStatus).toUpperCase() === "ACTIVE";

      return {
        id: String(gSrv._id || index + 1).padStart(2, "0"),
        serviceCode: gSrv.serviceCode,
        serviceName: accSrv?.serviceName || gSrv.name,
        serviceStatus,
        accountServiceStatus,
        isAvailable,
      };
    });

    return res.status(200).json({
      success: true,
      accountId: account.accountId,
      ownerName: account.ownerName,
      services: formattedServices,
    });
  } catch (error) {
    console.error("Error in getAccountServices:", error);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
    });
  }
};
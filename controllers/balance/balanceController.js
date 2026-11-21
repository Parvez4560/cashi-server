import jwt from "jsonwebtoken";
import Account from "../../models/Account.js"; // আপনার Account মডেলের সঠিক পাথ দিন
import VirtualAccount from "../../models/VirtualAccount.js"; // আপনার VirtualAccount মডেলের সঠিক পাথ দিন

function getTotalBalancesByCurrency(balances = {}) {
  const totals = {};
  for (const [currency, codesObj] of Object.entries(balances)) {
    if (codesObj && typeof codesObj === "object") {
      totals[currency] = Object.values(codesObj).reduce(
        (sum, val) => sum + (Number(val) || 0),
        0
      );
    }
  }
  return totals;
}

export const getWalletBalances = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const deviceToken = req.headers["x-device-token"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "MISSING_ACCESS_TOKEN",
      });
    }

    if (!deviceToken) {
      return res.status(401).json({
        success: false,
        code: "MISSING_DEVICE_TOKEN",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        code: err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
      });
    }

    const account = await Account.findOne({ accountId: decoded.accountId })
      .select("accountId status trustedDevice")
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

    if (!account.trustedDevice || account.trustedDevice.deviceToken !== deviceToken) {
      return res.status(403).json({
        success: false,
        code: "UNTRUSTED_DEVICE",
      });
    }

    const virtualAccounts = await VirtualAccount.find({
      accountId: account.accountId,
      status: "ACTIVE",
    })
      .select("virtualId balances -_id")
      .lean();

    const balancesList = virtualAccounts.map((va) => ({
      virtualId: va.virtualId,
      balances: getTotalBalancesByCurrency(va.balances),
    }));

    return res.status(200).json({
      success: true,
      balances: balancesList,
    });
  } catch (error) {
    console.error("Error fetching wallet balances:", error);
    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
    });
  }
};
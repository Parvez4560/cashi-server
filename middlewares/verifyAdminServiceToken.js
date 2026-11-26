import crypto from "crypto";
import Admin from "../models/admin/adminModel.js";

export const verifyAdminServiceToken = (requiredScope = "sms:send") => {
  return async (req, res, next) => {
    try {
      const headerToken =
        req.headers["x-service-token"] ||
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.split(" ")[1]
          : null);

      if (!headerToken) {
        return res.status(401).json({
          success: false,
          message: "সার্ভিস টোকেন পাওয়া যায়নি!",
        });
      }

      const tokenHash = crypto
        .createHash("sha256")
        .update(headerToken.trim())
        .digest("hex");

      const admin = await Admin.findOne({
        "serviceTokens.tokenHash": tokenHash,
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "অবৈধ সার্ভিস টোকেন!",
        });
      }

      const matchedToken = admin.serviceTokens.find(
        (t) => t.tokenHash === tokenHash
      );

      if (!matchedToken || matchedToken.isActive === false) {
        return res.status(403).json({
          success: false,
          message: "এই সার্ভিস টোকেনটি নিষ্ক্রিয় করা হয়েছে!",
        });
      }

      if (matchedToken.expiresAt && new Date(matchedToken.expiresAt) < new Date()) {
        return res.status(401).json({
          success: false,
          message: "সার্ভিস টোকেনের মেয়াদ শেষ হয়ে গেছে!",
        });
      }

      if (
        requiredScope &&
        Array.isArray(matchedToken.scopes) &&
        matchedToken.scopes.length > 0 &&
        !matchedToken.scopes.includes(requiredScope)
      ) {
        return res.status(403).json({
          success: false,
          message: `এই কাজের জন্য '${requiredScope}' অনুমতি নেই!`,
        });
      }

      matchedToken.lastUsedAt = new Date();
      await admin.save();

      req.admin = admin;
      req.serviceToken = matchedToken;
      next();
    } catch (error) {
      console.error("Admin Service Token Middleware Error:", error);
      return res.status(500).json({
        success: false,
        message: "টোকেন যাচাই করতে সার্ভার এরর হয়েছে!",
      });
    }
  };
};
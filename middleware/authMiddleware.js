import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
      }

      // ✅ Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Attach user to request (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }

      next();
    } catch (error) {
      console.error("❌ Token verification failed:", error.message);

      return res.status(401).json({
        message: error.name === "TokenExpiredError"
          ? "Unauthorized: Token expired"
          : "Unauthorized: Invalid token",
      });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
};
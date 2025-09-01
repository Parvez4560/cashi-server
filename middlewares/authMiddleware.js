import jwt from "jsonwebtoken";
import User from "../models/User.js"; // ✅ নিশ্চিত করুন সঠিক মডেল ফাইল ব্যবহার করছেন

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    // ✅ Verify Token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("❌ JWT Verification Error:", err.message);
      return res.status(401).json({
        message:
          err.name === "TokenExpiredError"
            ? "Unauthorized: Token expired"
            : "Unauthorized: Invalid token",
      });
    }

    // ✅ Find User
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Protect Middleware Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
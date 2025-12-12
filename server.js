import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import registerRoutes from "./routes/index.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(helmet());
app.use(morgan("dev"));

// Rate limiter
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));

// MongoDB
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// Routes
registerRoutes(app);

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
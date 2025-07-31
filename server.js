import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

// ✅ ES Module setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load env
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));

// ✅ Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: "Too many requests, try again later." },
});
app.use(limiter);

// ✅ MongoDB Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

mongoose.set("strictQuery", false);
mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

// ✅ Health Check
app.get("/", (req, res) => {
  res.json({ status: "✅ Server Running", app: "Hisabi Accounting" });
});

// ✅ Import Routes
import authRoutes from "./routes/auth.js";
import recordRoutes from "./routes/records.js";
import userRoutes from "./routes/userRoutes.js";
import statsRoutes from "./routes/stats.js";
import transactionRoutes from "./routes/transaction.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";

// ✅ Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/user", userRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/suppliers", supplierRoutes);

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
import authRoutes from "./auth.js";
import recordRoutes from "./records.js";
import userRoutes from "./userRoutes.js";
import statsRoutes from "./stats.js";
import transactionRoutes from "./transaction.routes.js";
import customerRoutes from "./customer.routes.js";
import employeeRoutes from "./employee.routes.js";
import supplierRoutes from "./supplier.routes.js";
import storeRoutes from "./storeRoutes.js";
import operatorRoutes from "./operatorRoutes.js";
import addressRoutes from "./addressRoutes.js";
import adminRoutes from "./adminRoutes.js";

export default function registerRoutes(app) {
  app.use("/api/auth", authRoutes);
  app.use("/api/records", recordRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/customers", customerRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/suppliers", supplierRoutes);
  app.use("/api/store", storeRoutes);
  app.use("/api/operators", operatorRoutes);
  app.use("/api/address", addressRoutes);
  app.use("/api/admin", adminRoutes);
}
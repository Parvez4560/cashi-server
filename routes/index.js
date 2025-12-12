import authRoutes from "./auth.js";
import userRoutes from "./user.js";
import customerRoutes from "./customer.js";

export default function registerRoutes(app) {
  app.use("/auth", authRoutes);
  app.use("/user", userRoutes);
  app.use("/customers", customerRoutes);
}
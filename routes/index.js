import authRoutes from "./auth.js";
import userRoutes from "./user.js";
import customerRoutes from "./customer.routes.js";
import adminRoutes from "./adminRoutes.js";
import localeRoutes from "./locale.js";

export default function registerRoutes(app) {
  app.use("/auth", authRoutes);
  app.use("/user", userRoutes);
  app.use("/customers", customerRoutes);
  app.use("/admin", adminRoutes);
  app.use("/locale", localeRoutes);
}
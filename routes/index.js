import authRoutes from "./auth.routes.js";
import localeRoutes from "./locale.js";
import adminRoutes from "./admin/adminRoutes.js";
import smsRoutes from "./sms/smsRoutes.js";

export default function registerRoutes(app) {
  app.use("/account", authRoutes);
  app.use("/locale", localeRoutes);
  app.use("/admin", adminRoutes);
  app.use("/api/sms", smsRoutes);
}
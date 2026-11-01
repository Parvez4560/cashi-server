import authRoutes from "./auth.routes.js";
import localeRoutes from "./locale.js";

export default function registerRoutes(app) {
  app.use("/account", authRoutes);
  app.use("/locale", localeRoutes);
}
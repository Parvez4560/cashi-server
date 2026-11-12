import authRoutes from "./authRoutes.js";
import localeRoutes from "./locale.js";
import adminRoutes from "./admin/adminRoutes.js";
import smsRoutes from "./sms/smsRoutes.js";
import registrationOtpRoutes from "./otp/registrationOtpRoutes.js";
import phoneRulesRoutes from './phone-rules/phoneRulesRoutes.js';
import virtualAccountRoutes from './virtualAccountRoutes.js';
import checkAccountRoutes from './check-account/checkAccountRoute.js';
import loginRoutes from './login/loginAccountRoutes.js';

export default function registerRoutes(app) {
  app.use("/account", authRoutes);
  app.use("/locale", localeRoutes);
  app.use("/admin", adminRoutes);
  app.use("/api/sms", smsRoutes);
  app.use("/api/otp/registration", registrationOtpRoutes)
  app.use('/api/countries', phoneRulesRoutes);
  app.use('/api/virtual-accounts', virtualAccountRoutes);
  app.use("/api/account", checkAccountRoutes);
  app.use("/api/login", loginRoutes);
}
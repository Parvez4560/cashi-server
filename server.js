const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet'); // Security headers
const rateLimit = require('express-rate-limit'); // Rate limiting
const path = require('path');

// ✅ Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Adds security headers
app.use(morgan('dev'));

// ✅ Rate Limiting (Protect from brute force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ✅ MongoDB Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ✅ Health Check Route
app.get('/', (req, res) => {
  res.json({ status: '✅ Server is running', app: 'Hisabi Accounting' });
});

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/records', require('./routes/records'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/transactions', require('./routes/transaction.routes'));

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: '❌ Route not found' });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Global error handler:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Hisabi Server started on http://localhost:${PORT}`);
});
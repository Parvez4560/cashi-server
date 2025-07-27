const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan'); // For logging requests

// Load environment variables
dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // JSON body with image (base64) support
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logs incoming requests

// ✅ MongoDB Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ✅ Root health check
app.get('/', (req, res) => {
  res.send('📊 Hisabi Accounting Server is running!');
});

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));           // Authentication routes
app.use('/api/records', require('./routes/records'));     // Accounting records routes
app.use('/api/users', require('./routes/users'));         // Old user routes (optional)
app.use('/api/user', require('./routes/userRoutes'));     // New user routes
app.use('/api/stats', require('./routes/stats'));         // Dashboard stats routes

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Global error handler:', err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Hisabi Server started on port ${PORT}`);
});
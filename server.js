const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // JSON request body পার্স করার জন্য

// MongoDB URI from .env
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Root route (health check)
app.get('/', (req, res) => {
  res.send('📊 Hisabi Accounting Server is running!');
});

// Routes
app.use('/api/auth', require('./routes/auth'));           // Authentication routes
app.use('/api/records', require('./routes/records'));     // Accounting records routes
app.use('/api/users', require('./routes/users'));         // Old user routes (optional)

const userRoutes = require('./routes/userRoutes');        // New user routes (e.g. register, profile)
app.use('/api/user', userRoutes);

app.use('/api/stats', require('./routes/stats'));         // Dashboard stats routes

// 404 handler (optional)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ message: 'Server error' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Hisabi Server started on port ${PORT}`);
});
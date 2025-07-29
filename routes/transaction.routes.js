const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// ✅ Middleware: টোকেন যাচাই এবং req.user এ ইউজার যোগ করা
const protect = async (req, res, next) => {
  let token;

  // ✅ Check for Authorization Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
      }

      // ✅ Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Attach user to request (without password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next(); // ✅ Everything is fine, move forward
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Unauthorized: Token expired' });
      }

      res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
};

module.exports = { protect };
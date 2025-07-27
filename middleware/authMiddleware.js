const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware function: টোকেন যাচাই করে এবং ইউজারের তথ্য `req.user` এ যোগ করে
const protect = async (req, res, next) => {
  let token;

  // চেক করা হচ্ছে হেডারে টোকেন আছে কিনা এবং 'Bearer' দিয়ে শুরু হয়েছে কিনা
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // টোকেন কাটা হচ্ছে
      token = req.headers.authorization.split(' ')[1];

      // টোকেন যাচাই করা হচ্ছে
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ইউজারের তথ্য খুঁজে বের করে req.user এ যোগ করা হচ্ছে (password বাদ দিয়ে)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // সব ঠিক থাকলে পরবর্তী middleware বা route handler এ যাওয়া হবে
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ message: 'Unauthorized: Token failed' });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
};

module.exports = { protect };
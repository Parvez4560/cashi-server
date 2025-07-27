const express = require('express');
const router = express.Router();

// Stats route - ড্যাশবোর্ড বা রিপোর্ট সংক্রান্ত API
router.get('/', (req, res) => {
  res.json({ message: '📊 Stats route is working!' });
});

module.exports = router;
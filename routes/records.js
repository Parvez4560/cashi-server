const express = require('express');
const router = express.Router();

// Sample route for accounting entries
router.get('/', (req, res) => {
  res.json({ message: '📒 Hisab records API is working!' });
});

module.exports = router;
 
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

//  সিম্পল অথেন্টিকেশন middleware
const auth = (req, res, next) => {
  // শুধু ডেমো: ভবিষ্যতে JWT দিয়ে validate করবেন
  req.user = { id: req.headers['userid'] }; // ইউজার আইডি header এ পাঠান
  next();
};

//  ট্রানজেকশন যোগ
router.post('/add', auth, async (req, res) => {
  const { type, amount, category, note, date } = req.body;

  try {
    const transaction = new Transaction({
      user: req.user.id,
      type,
      amount,
      category,
      note,
      date
    });

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

//  ইউজারের সব ট্রানজেকশন
router.get('/my', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
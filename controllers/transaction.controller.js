import Transaction from '../models/transaction.model.js';
import Customer from '../models/customer.model.js';

// নতুন ট্রানজেকশন যোগ করা
export const addTransaction = async (req, res) => {
  try {
    const { customerId, type, amount, note } = req.body;

    if (!customerId || !type || amount == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const customer = await Customer.findOne({ _id: customerId, user: req.user._id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found for this user' });
    }

    const transaction = new Transaction({
      user: req.user._id,
      customer: customerId,
      type,
      amount,
      note,
    });

    await transaction.save();

    if (type === 'credit') {
      customer.balance += amount;
    } else {
      customer.balance -= amount;
    }
    await customer.save();

    res.status(201).json({ message: 'Transaction added successfully', transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// নির্দিষ্ট ইউজারের সব ট্রানজেকশন
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('customer', 'name phone')
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// নির্দিষ্ট গ্রাহকের ট্রানজেকশন
export const getCustomerTransactions = async (req, res) => {
  try {
    const { customerId } = req.params;
    const transactions = await Transaction.find({
      user: req.user._id,
      customer: customerId,
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
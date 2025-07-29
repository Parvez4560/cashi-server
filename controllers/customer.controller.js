import Customer from '../models/customer.model.js';

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const customer = new Customer({ name, phone, address });
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
import Customer from '../models/customer.model.js';

// ✅ Create Customer
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const customer = new Customer({
      name,
      phone,
      address,
      userId: req.user.id // ✅ Linked with logged-in user
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get All Customers for logged-in user
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user.id }); // ✅ Filter by userId
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
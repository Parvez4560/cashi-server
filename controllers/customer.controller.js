import Customer from "../models/customer.model.js";

// ✅ Create Customer
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, address, email } = req.body;

    const newCustomer = new Customer({
      name,
      phone,
      address,
      email,
      user: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ user: req.user._id });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
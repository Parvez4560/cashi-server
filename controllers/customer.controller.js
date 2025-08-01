import Customer from "../models/customer.model.js";

// Create Customer
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, address, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    // Check duplicate phone for the same userId
    const existingCustomer = await Customer.findOne({ phone, userId: req.user._id });
    if (existingCustomer) {
      return res.status(409).json({ message: "Customer with this phone already exists" });
    }

    const newCustomer = new Customer({
      name,
      phone,
      address,
      email,
      userId: req.user._id,   // এখানে userId ফিল্ড ব্যবহার করা হয়েছে
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    const savedCustomer = await newCustomer.save();
    res.status(201).json({ message: "Customer added successfully", data: savedCustomer });
  } catch (error) {
    console.error("❌ Error creating customer:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get All Customers for logged-in user
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    console.error("❌ Error fetching customers:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
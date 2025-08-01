import Customer from "../models/customer.model.js";
import Supplier from "../models/supplier.model.js";
import Employee from "../models/employee.model.js";

// ✅ Create Customer
export const createCustomer = async (req, res) => {
  try {
    const { name, phone, address, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    // ✅ Check if this phone exists in Customer, Supplier or Employee for the same userId
    const existingCustomer = await Customer.findOne({ phone, userId: req.user._id });
    const existingSupplier = await Supplier.findOne({ phone, userId: req.user._id });
    const existingEmployee = await Employee.findOne({ phone, userId: req.user._id });

    if (existingCustomer || existingSupplier || existingEmployee) {
      let type = existingCustomer
        ? "Customer"
        : existingSupplier
        ? "Supplier"
        : "Employee";

      return res.status(400).json({
        message: `এই নাম্বারটি আগে থেকেই ${type} হিসেবে রেজিস্টার করা হয়েছে।`,
      });
    }

    const newCustomer = new Customer({
      name,
      phone,
      address,
      email,
      userId: req.user._id, // ✅ userId should exist in schema
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    const savedCustomer = await newCustomer.save();
    res.status(201).json({
      message: "Customer added successfully",
      data: savedCustomer,
    });
  } catch (error) {
    console.error("❌ Error creating customer:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Get All Customers for logged-in user
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(customers);
  } catch (error) {
    console.error("❌ Error fetching customers:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
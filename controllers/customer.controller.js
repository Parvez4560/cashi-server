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

    // ✅ Check if this phone exists in Customer, Supplier or Employee for the same user
    const [existingCustomer, existingSupplier, existingEmployee] = await Promise.all([
      Customer.findOne({ phone, user: req.user._id }),
      Supplier.findOne({ phone, user: req.user._id }),
      Employee.findOne({ phone, user: req.user._id }),
    ]);

    if (existingCustomer || existingSupplier || existingEmployee) {
      const type = existingCustomer ? "কাস্টমার" : existingSupplier ? "সাপ্লায়ার" : "কর্মচারী";
      return res.status(409).json({
        message: `এই নাম্বারটি আগে থেকেই ${type} হিসেবে রেজিস্টার করা হয়েছে।`,
      });
    }

    const newCustomer = new Customer({
      name,
      phone,
      address,
      email,
      user: req.user._id, // ✅ keep consistent with schema
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    const savedCustomer = await newCustomer.save();
    res.status(201).json({
      message: "কাস্টমার সফলভাবে যোগ হয়েছে।",
      data: savedCustomer,
    });

  } catch (error) {
    console.error("❌ Error creating customer:", error.message);

    // ✅ Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ message: "এই নাম্বারটি আগে থেকেই রেজিস্টার করা আছে।" });
    }

    res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।" });
  }
};

// ✅ Get All Customers for logged-in user
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    console.error("❌ Error fetching customers:", error.message);
    res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।" });
  }
};
import Supplier from "../models/supplier.model.js";
import Customer from "../models/customer.model.js";
import Employee from "../models/employee.model.js";

// ✅ Create Supplier
export const createSupplier = async (req, res) => {
  try {
    const { name, phone, email, address, products } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    // ✅ Check duplicate phone in Customer, Employee, or Supplier for this user
    const existingCustomer = await Customer.findOne({ phone, userId: req.user._id });
    const existingEmployee = await Employee.findOne({ phone, userId: req.user._id });
    const existingSupplier = await Supplier.findOne({ phone, userId: req.user._id });

    if (existingCustomer || existingEmployee || existingSupplier) {
      let type = existingCustomer
        ? "Customer"
        : existingEmployee
        ? "Employee"
        : "Supplier";

      return res.status(400).json({
        message: `এই নাম্বারটি আগে থেকেই ${type} হিসেবে রেজিস্টার করা হয়েছে।`,
      });
    }

    const newSupplier = new Supplier({
      name,
      phone,
      email,
      address,
      products,
      userId: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    const savedSupplier = await newSupplier.save();
    res.status(201).json({
      message: "Supplier added successfully",
      data: savedSupplier,
    });
  } catch (error) {
    console.error("❌ Error creating supplier:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Get All Suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (error) {
    console.error("❌ Error fetching suppliers:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
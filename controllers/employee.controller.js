import Employee from "../models/employee.model.js";
import Customer from "../models/customer.model.js";
import Supplier from "../models/supplier.model.js";

// ✅ Create Employee
export const createEmployee = async (req, res) => {
  try {
    const { name, position, phone, email, address, salary } = req.body;

    if (!name || !position || !phone) {
      return res.status(400).json({ message: "Name, position, and phone are required" });
    }

    // ✅ Check duplicate phone in Customer, Supplier, or Employee for this user
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

    const newEmployee = new Employee({
      name,
      position,
      phone,
      email,
      address,
      salary,
      userId: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json({
      message: "Employee added successfully",
      data: savedEmployee,
    });
  } catch (error) {
    console.error("❌ Error creating employee:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Get Employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(employees);
  } catch (error) {
    console.error("❌ Error fetching employees:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
import Employee from "../models/employee.model.js";
import Customer from "../models/customer.model.js";
import Supplier from "../models/supplier.model.js";

// ✅ Create Employee
export const createEmployee = async (req, res) => {
  try {
    const { name, position, phone, email, address, salary } = req.body;

    if (!name || !position || !phone) {
      return res.status(400).json({ message: "নাম, পজিশন এবং ফোন প্রয়োজনীয়" });
    }

    // ✅ একসাথে তিনটি চেকের জন্য Promise.all ব্যবহার করা হলো
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

    const newEmployee = new Employee({
      name,
      position,
      phone,
      email,
      address,
      salary,
      user: req.user._id, // ✅ consistent field name
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json({
      message: "কর্মচারী সফলভাবে যোগ করা হয়েছে।",
      data: savedEmployee,
    });

  } catch (error) {
    console.error("❌ Error creating employee:", error.message);

    // ✅ MongoDB ডুপ্লিকেট key এরর হ্যান্ডেল
    if (error.code === 11000) {
      return res.status(409).json({ message: "এই নাম্বারটি আগে থেকেই রেজিস্টার করা আছে।" });
    }

    res.status(500).json({
      message: "সার্ভারে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।",
    });
  }
};

// ✅ Get Employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    console.error("❌ Error fetching employees:", error.message);
    res.status(500).json({
      message: "সার্ভারে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।",
    });
  }
};
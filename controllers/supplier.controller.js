import Supplier from "../models/supplier.model.js";
import Customer from "../models/customer.model.js";
import Employee from "../models/employee.model.js";

// ✅ Create Supplier
export const createSupplier = async (req, res) => {
  try {
    const { name, phone, email, address, products } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "নাম এবং ফোন প্রয়োজনীয়" });
    }

    // ✅ একই userId এর মধ্যে ডুপ্লিকেট চেক করা
    const [existingCustomer, existingEmployee, existingSupplier] = await Promise.all([
      Customer.findOne({ phone, userId: req.user._id }),
      Employee.findOne({ phone, userId: req.user._id }),
      Supplier.findOne({ phone, userId: req.user._id }),
    ]);

    if (existingCustomer || existingEmployee || existingSupplier) {
      const type = existingCustomer ? "কাস্টমার" : existingEmployee ? "কর্মচারী" : "সাপ্লায়ার";
      return res.status(409).json({
        message: `এই নাম্বারটি আগে থেকেই ${type} হিসেবে রেজিস্টার করা হয়েছে।`,
      });
    }

    const newSupplier = new Supplier({
      name,
      phone,
      email,
      address,
      products,
      userId: req.user._id, // ✅ Fix: user → userId
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    const savedSupplier = await newSupplier.save();
    res.status(201).json({
      message: "✅ সাপ্লায়ার সফলভাবে যোগ হয়েছে।",
      data: savedSupplier,
    });

  } catch (error) {
    console.error("❌ Error creating supplier:", error.message);

    // ✅ MongoDB ডুপ্লিকেট key এরর হ্যান্ডেল
    if (error.code === 11000) {
      return res.status(409).json({ message: "এই নাম্বারটি আগে থেকেই রেজিস্টার করা আছে।" });
    }

    res.status(500).json({
      message: "সার্ভারে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।",
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
      message: "সার্ভারে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।",
    });
  }
};
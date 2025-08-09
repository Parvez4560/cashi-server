import fs from "fs";
import path from "path";
import Customer from "../models/customer.model.js";
import Supplier from "../models/supplier.model.js";
import Employee from "../models/employee.model.js";

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, address, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    // ফোন নম্বর আগে থেকে আছে কি না চেক করা
    const [existingCustomer, existingSupplier, existingEmployee] = await Promise.all([
      Customer.findOne({ phone, userId: req.user._id }),
      Supplier.findOne({ phone, userId: req.user._id }),
      Employee.findOne({ phone, userId: req.user._id }),
    ]);

    if (existingCustomer || existingSupplier || existingEmployee) {
      const type = existingCustomer ? "কাস্টমার" : existingSupplier ? "সাপ্লায়ার" : "কর্মচারী";
      return res.status(409).json({
        message: `এই নাম্বারটি আগে থেকেই ${type} হিসেবে রেজিস্টার করা হয়েছে।`,
      });
    }

    // যদি req.file থাকে, তাহলে ফাইলের এক্সটেনশন চেক করতে পারেন (ঐচ্ছিক)
    if (req.file) {
      const allowedExtensions = [".jpg", ".jpeg", ".png"];
      const ext = path.extname(req.file.filename).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        // যদি ভুল ফাইল আসে, আপলোড করা ফাইল মুছে দিন
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "শুধুমাত্র jpg, jpeg, png ফাইল আপলোড করতে পারেন।" });
      }
    }

    // নতুন কাস্টমার তৈরি
    const newCustomer = new Customer({
      name,
      phone,
      address,
      email,
      userId: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    const savedCustomer = await newCustomer.save();

    res.status(201).json({
      message: "✅ কাস্টমার সফলভাবে যোগ হয়েছে।",
      data: savedCustomer,
    });

  } catch (error) {
    console.error("❌ Error creating customer:", error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: "এই নাম্বারটি আগে থেকেই রেজিস্টার করা আছে।" });
    }
    res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।" });
  }
};
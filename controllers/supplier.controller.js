import Supplier from "../models/supplier.model.js";

export const createSupplier = async (req, res) => {
  try {
    const { name, phone, email, address, products } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    // ডুপ্লিকেট ফোন চেক (ঐ userId এর মধ্যে)
    const existingSupplier = await Supplier.findOne({ phone, userId: req.user._id });
    if (existingSupplier) {
      return res.status(409).json({ message: "Supplier with this phone already exists" });
    }

    const newSupplier = new Supplier({
      name,
      phone,
      email,
      address,
      products,
      userId: req.user._id,  // userId হিসেবে সেভ হচ্ছে
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    const savedSupplier = await newSupplier.save();
    res.status(201).json({ message: "Supplier added successfully", data: savedSupplier });
  } catch (error) {
    console.error("❌ Error creating supplier:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (error) {
    console.error("❌ Error fetching suppliers:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
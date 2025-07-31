import Supplier from "../models/supplier.model.js";

export const createSupplier = async (req, res) => {
  try {
    const { name, phone, email, address, products } = req.body;

    const newSupplier = new Supplier({
      name,
      phone,
      email,
      address,
      products,
      user: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newSupplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ user: req.user._id });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
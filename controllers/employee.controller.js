import Employee from "../models/employee.model.js";

export const createEmployee = async (req, res) => {
  try {
    const { name, position, phone, email, address, salary } = req.body;

    if (!name || !position || !phone) {
      return res.status(400).json({ message: "Name, position, and phone are required" });
    }

    // ডুপ্লিকেট ফোন চেক (ঐ userId এর মধ্যে)
    const existingEmployee = await Employee.findOne({ phone, userId: req.user._id });
    if (existingEmployee) {
      return res.status(409).json({ message: "Employee with this phone already exists" });
    }

    const newEmployee = new Employee({
      name,
      position,
      phone,
      email,
      address,
      salary,
      userId: req.user._id,   // userId ফিল্ড হিসেবে
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json({ message: "Employee added successfully", data: savedEmployee });
  } catch (error) {
    console.error("❌ Error creating employee:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    console.error("❌ Error fetching employees:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
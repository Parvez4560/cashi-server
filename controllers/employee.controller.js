import Employee from "../models/employee.model.js";

export const createEmployee = async (req, res) => {
  try {
    const { name, position, phone, email, address, salary } = req.body;

    const newEmployee = new Employee({
      name,
      position,
      phone,
      email,
      address,
      salary,
      user: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ user: req.user._id });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
import { Operator } from '../models/operatorModel.js';
import { responseHandler } from '../utils/responseHandler.js';

export const operatorController = {
  // সব অপারেটর ফেচ
  getAllOperators: async (req, res) => {
    try {
      const { country } = req.query;
      const query = country ? { country } : {};
      const operators = await Operator.find(query).sort({ createdAt: 1 });
      return responseHandler.success(res, operators, 'Operators fetched successfully');
    } catch (err) {
      return responseHandler.error(res, err.message);
    }
  },

  // নতুন অপারেটর তৈরি
  createOperator: async (req, res) => {
    try {
      const { name, image_url, country } = req.body;
      if (!name || !image_url) {
        return responseHandler.error(res, 'Name and Image URL are required', 400);
      }
      const newOperator = await Operator.create({ name, image_url, country });
      return responseHandler.success(res, newOperator, 'Operator created', 201);
    } catch (err) {
      return responseHandler.error(res, err.message);
    }
  },

  // অপারেটর আপডেট
  updateOperator: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedOperator = await Operator.findByIdAndUpdate(id, updates, { new: true });
      if (!updatedOperator) return responseHandler.notFound(res, 'Operator not found');
      return responseHandler.success(res, updatedOperator, 'Operator updated');
    } catch (err) {
      return responseHandler.error(res, err.message);
    }
  },

  // অপারেটর ডিলিট
  deleteOperator: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedOperator = await Operator.findByIdAndDelete(id);
      if (!deletedOperator) return responseHandler.notFound(res, 'Operator not found');
      return responseHandler.success(res, null, 'Operator deleted');
    } catch (err) {
      return responseHandler.error(res, err.message);
    }
  },
};
import mongoose from 'mongoose';

const operatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image_url: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'BD', // Bangladesh by default
    },
  },
  { timestamps: true }
);

export const Operator = mongoose.model('Operator', operatorSchema);
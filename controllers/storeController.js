import Store from '../models/store.js';
import { v4 as uuidv4 } from 'uuid';

export const createStore = async (req, res) => {
  try {
    const { userId, storeName, address, phone } = req.body;

    if (!userId || !storeName) {
      return res.status(400).json({ message: "UserId এবং StoreName অবশ্যই দিতে হবে" });
    }

    // ইউনিক storeId তৈরি (UUID)
    const storeId = uuidv4();

    const newStore = new Store({
      storeId,
      userId,
      storeName,
      address,
      phone,
    });

    await newStore.save();

    res.status(201).json({ message: "স্টোর তৈরি হয়েছে", store: newStore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "সার্ভার ত্রুটি" });
  }
};
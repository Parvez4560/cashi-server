import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
  storeId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeName: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Store = mongoose.model('Store', StoreSchema);
export default Store;
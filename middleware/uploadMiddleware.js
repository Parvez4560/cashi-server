import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';

// এনভায়রনমেন্ট ভেরিয়েবল লোড নিশ্চিত করা
dotenv.config();

// আলাদা করে কী বা সিক্রেট লেখার দরকার নেই, 
// .env ফাইলে থাকা CLOUDINARY_URL স্বয়ংক্রিয়ভাবে এটি রিড করে নেবে।
cloudinary.config(); 

// ক্লাউডিনারিতে ফাইল সংরক্ষণের জন্য স্টোরেজ কনফিগারেশন
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cashi_merchant_documents', // ক্লাউডিনারিতে ফোল্ডারের নাম
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    public_id: (req, file) => 'doc_' + Date.now() + '_' + Math.round(Math.random() * 1E9),
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // সর্বোচ্চ ১০ মেগাবাইট লিমিট
});

// মাল্টিপল ফাইল ফিল্ডের কনফিগারেশন
export const cpUpload = upload.fields([
  { name: 'nidFront', maxCount: 1 },
  { name: 'nidBack', maxCount: 1 },
  { name: 'ownerPhoto', maxCount: 1 },
  { name: 'nomineeNidDoc', maxCount: 1 },
  { name: 'businessShopPhoto', maxCount: 1 },
  { name: 'utilityBillDoc', maxCount: 1 },
  { name: 'tradeLicenseDoc', maxCount: 1 },
]);
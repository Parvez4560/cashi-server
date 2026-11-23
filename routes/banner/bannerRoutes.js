import express from 'express';
import {
  getBannersByPlacement,
  getAdminBanners,
  addBanner,
  updateBanner,
  deleteBanner
} from '../../controllers/banner/bannerController.js';

const router = express.Router();

router.get('/', getBannersByPlacement);

router.get('/admin', getAdminBanners);
router.post('/admin', addBanner);
router.put('/admin/:id', updateBanner);
router.delete('/admin/:id', deleteBanner);

export default router;
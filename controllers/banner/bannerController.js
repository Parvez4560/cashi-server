import Banner from '../../models/banner/bannerModel.js';

// অ্যাপ থেকে শুধু placement অনুযায়ী ওই পেজের সব ব্যানার পাঠানো
// GET /api/banners?placement=HOME
export const getBannersByPlacement = async (req, res) => {
  try {
    const placement = (req.query.placement || '').toUpperCase().trim();
    if (!placement) {
      return res.status(400).json({
        success: false,
        message: 'placement is required'
      });
    }

    const banners = await Banner.find({
      placement,
      isActive: true
    }).sort({ priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: banners
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// অ্যাডমিন অ্যাপ: ব্যানার লিস্ট দেখা
// GET /api/banners/admin
export const getAdminBanners = async (req, res) => {
  try {
    const filter = {};
    if (req.query.placement) filter.placement = req.query.placement.toUpperCase().trim();
    if (req.query.accountType) filter.accountType = req.query.accountType.toUpperCase().trim();
    if (req.query.subType) filter.subType = req.query.subType.toUpperCase().trim();

    const banners = await Banner.find(filter).sort({ placement: 1, priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: banners
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// অ্যাডমিন অ্যাপ: নতুন ব্যানার অ্যাড করা
// POST /api/banners/admin
export const addBanner = async (req, res) => {
  try {
    const { title, imageUrl, url, placement, accountType, subType, priority, isActive } = req.body;

    if (!title || !imageUrl || !placement) {
      return res.status(400).json({
        success: false,
        message: 'title, imageUrl, and placement are required'
      });
    }

    const created = await Banner.create({
      title,
      imageUrl,
      url: url || '',
      placement,
      accountType: accountType || 'ALL',
      subType: subType || 'ALL',
      priority: priority ?? 0,
      isActive: isActive ?? true
    });

    res.status(201).json({
      success: true,
      message: 'Banner added',
      data: created
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// অ্যাডমিন অ্যাপ: ব্যানার আপডেট করা
// PUT /api/banners/admin/:id
export const updateBanner = async (req, res) => {
  try {
    const updated = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Banner updated',
      data: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// অ্যাডমিন অ্যাপ: ব্যানার ডিলিট করা
// DELETE /api/banners/admin/:id
export const deleteBanner = async (req, res) => {
  try {
    const deleted = await Banner.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Banner deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
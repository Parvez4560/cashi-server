import Banner from '../../models/banner/bannerModel.js';

// একাধিক subTypes বা সিঙ্গেল subType নরমালাইজ করার হেল্পার
const normalizeSubTypes = (subTypes, subType) => {
  let list = [];
  if (Array.isArray(subTypes)) {
    list = subTypes.map((item) => String(item || '').trim().toUpperCase()).filter(Boolean);
  } else if (typeof subTypes === 'string' && subTypes.trim()) {
    list = subTypes.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean);
  } else if (typeof subType === 'string' && subType.trim()) {
    list = subType.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean);
  }

  if (list.length === 0 || list.includes('ALL')) {
    return ['ALL'];
  }
  return [...new Set(list)];
};

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
    if (req.query.subType) {
      const st = req.query.subType.toUpperCase().trim();
      filter.$or = [{ subTypes: st }, { subType: st }];
    }

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
    const { title, imageUrl, url, placement, accountType, subType, subTypes, priority, isActive } = req.body;

    if (!title || !imageUrl || !placement) {
      return res.status(400).json({
        success: false,
        message: 'title, imageUrl, and placement are required'
      });
    }

    const cleanAccountType = (accountType || '').toString().trim().toUpperCase() || 'ALL';
    const cleanSubTypes = normalizeSubTypes(subTypes, subType);
    const cleanSubType = cleanSubTypes.length === 1 ? cleanSubTypes[0] : cleanSubTypes.join(',');

    const created = await Banner.create({
      title,
      imageUrl,
      url: url || '',
      placement,
      accountType: cleanAccountType,
      subTypes: cleanSubTypes,
      subType: cleanSubType,
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
    const updatePayload = { ...req.body };

    if (updatePayload.accountType !== undefined) {
      updatePayload.accountType = String(updatePayload.accountType || '').trim().toUpperCase() || 'ALL';
    }

    if (updatePayload.subTypes !== undefined || updatePayload.subType !== undefined) {
      const cleanSubTypes = normalizeSubTypes(updatePayload.subTypes, updatePayload.subType);
      updatePayload.subTypes = cleanSubTypes;
      updatePayload.subType = cleanSubTypes.length === 1 ? cleanSubTypes[0] : cleanSubTypes.join(',');
    }

    const updated = await Banner.findByIdAndUpdate(
      req.params.id,
      updatePayload,
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
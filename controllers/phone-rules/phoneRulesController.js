import CountryConfig from '../../models/phone-rules/phoneRulesModel.js';

/**
 * @desc    Get all country rules or specific country rule by ISO code
 * @route   GET /api/countries/rules?iso=BD
 * @access  Public
 */
export const getCountryRules = async (req, res) => {
  try {
    const { iso } = req.query; // কুয়েরি প্যারামিটার থেকে ISO কোড ধরবে

    let query = {};
    if (iso) {
      query.countryIso = iso.toUpperCase();
      const countryRule = await CountryConfig.findOne(query);

      if (!countryRule) {
        return res.status(404).json({
          success: false,
          message: `"${iso.toUpperCase()}" এই দেশের কোনো ফোন নাম্বার রুলস পাওয়া যায়নি।`
        });
      }

      return res.status(200).json({
        success: true,
        data: countryRule
      });
    }

    // সব দেশের রুলস একসাথে পাওয়ার জন্য
    const allRules = await CountryConfig.find({}).sort({ countryName: 1 });

    return res.status(200).json({
      success: true,
      count: allRules.length,
      data: allRules
    });

  } catch (error) {
    console.error('Get Country Rules Error:', error);
    return res.status(500).json({
      success: false,
      message: 'সার্ভারে অভ্যন্তরীণ সমস্যা দেখা দিয়েছে।'
    });
  }
};
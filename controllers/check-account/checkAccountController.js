import Account from '../../models/Account.js';

export const checkAccountController = async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        if (!mobileNumber) {
            return res.status(400).json({
                success: false,
                message: "মোবাইল নাম্বার প্রদান করুন।"
            });
        }

        const account = await Account.findOne({ mobileNumber });

        if (!account) {
            return res.status(200).json({
                success: true,
                exists: false,
                message: "এই নাম্বারে কোনো একাউন্ট পাওয়া যায়নি।"
            });
        }

        return res.status(200).json({
            success: true,
            exists: true,
            data: {
                accountId: account.accountId,
                mobileNumber: account.mobileNumber,
                category: account.accountType,
                subCategory: account.subType,
                status: account.status
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "সার্ভারে সমস্যা হয়েছে।"
        });
    }
};
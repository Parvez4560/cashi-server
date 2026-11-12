import Account from '../../models/Account.js';

export const checkAccountController = async (req, res) => {
    try {
        const { mobileNumber, vid } = req.body;

        if (!mobileNumber && !vid) {
            return res.status(400).json({
                success: false,
                errorCode: "MISSING_PARAMS"
            });
        }

        let query = {};
        let searchByVidOnly = false;

        if (vid) {
            // এখানে ডাটাবেজের আসল ফিল্ডের নাম 'virtualIDs' দেওয়া হলো
            query.virtualIDs = vid; 
            if (!mobileNumber) {
                searchByVidOnly = true; 
            }
        } else if (mobileNumber) {
            query.mobileNumber = mobileNumber;
        }

        const account = await Account.findOne(query);

        if (!account) {
            return res.status(200).json({
                success: true,
                exists: false
            });
        }

        const responseData = {
            accountId: account.accountId,
            category: account.accountType,
            subCategory: account.subType,
            status: account.status,
            virtualIDs: account.virtualIDs || []
        };

        if (!searchByVidOnly) {
            responseData.mobileNumber = account.mobileNumber;
        }

        return res.status(200).json({
            success: true,
            exists: true,
            data: responseData
        });

    } catch (error) {
        console.error("Check Account Error:", error);
        return res.status(500).json({
            success: false,
            errorCode: "SERVER_ERROR"
        });
    }
};
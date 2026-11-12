import Account from '../../models/Account.js';

export const checkAccountController = async (req, res) => {
    try {
        const { mobileNumber, vid } = req.body;

        // চেক করা হচ্ছে মোবাইল নাম্বার অথবা VID যেকোনো একটা দেওয়া হয়েছে কি না
        if (!mobileNumber && !vid) {
            return res.status(400).json({
                success: false,
                errorCode: "MISSING_PARAMS"
            });
        }

        let query = {};
        let searchByVidOnly = false;

        // যদি ভার্চুয়াল আইডি (VID) দিয়ে সার্চ করা হয়
        if (vid) {
            query.virtualIds = { $in: [vid] }; 
            if (!mobileNumber) {
                searchByVidOnly = true; // শুধু VID দিয়ে সার্চ করলে মোবাইল নাম্বার দেখাবে না
            }
        } else if (mobileNumber) {
            query.mobileNumber = mobileNumber;
        }

        // ডাটাবেজ থেকে একাউন্ট খোঁজা
        const account = await Account.findOne(query);

        if (!account) {
            return res.status(200).json({
                success: true,
                exists: false
            });
        }

        // রেসপন্স ডেটা তৈরি করা
        const responseData = {
            accountId: account.accountId,
            category: account.accountType,
            subCategory: account.subType,
            status: account.status,
            virtualIds: account.virtualIds || []
        };

        // যদি শুধু VID দিয়ে সার্চ করা না হয় (অর্থাৎ মোবাইল নাম্বার দিয়ে করা হয়), তবেই মোবাইল নাম্বার দেখাবে
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
const MonitorLog = require("../models/MonitorLog");

const getUserLogs = async (req, res) => {
    try {

        // console.log(req.user); // DEBUG

        const logs = await MonitorLog.find({
            userId: req.user.id,
        })
        .populate("monitorId")
        .sort({ checkedAt: -1 });

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

module.exports = 
    getUserLogs

const Monitor = require("../models/Monitor");

const createMonitor = async (req, res) => {
    try {
        const monitor = await Monitor.create({
            ...req.body,
            userId: req.user.id,
        });

        res.status(201).json({
            success: true,
            data: monitor,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getMonitors = async (req, res) => {
    try {
        const monitors = await Monitor.find({
            userId: req.user.id,  
        });

        res.status(200).json({
            success: true,
            count: monitors.length,
            data: monitors,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteMonitor = async (req, res) => {
    try {
        const MonitorLog = require("../models/MonitorLog");
        const monitor = await Monitor.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!monitor) {
            return res.status(404).json({
                success: false,
                message: "Monitor not found or unauthorized",
            });
        }

        // Delete logs for this monitor
        await MonitorLog.deleteMany({ monitorId: req.params.id });

        res.status(200).json({
            success: true,
            message: "Monitor and logs deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createMonitor,
    getMonitors,
    deleteMonitor,
};

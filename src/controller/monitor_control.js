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


module.exports = {
    createMonitor,
    getMonitors,
};


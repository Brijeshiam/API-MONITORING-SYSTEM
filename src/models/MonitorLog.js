const mongoose = require("mongoose");

const monitorLogSchema = new mongoose.Schema(
    {
        monitorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Monitor",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["UP", "DOWN"],
            required: true,
        },

        responseTime: {
            type: Number,
            default: 0,
        },

        checkedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("MonitorLog", monitorLogSchema);


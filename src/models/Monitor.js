const mongoose = require("mongoose");

const monitorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        url: {
            type: String,
            required: true,
        },

        method: {
            type: String,
            enum: ["GET", "POST", "PUT", "DELETE"],
            default: "GET",
        },

        status: {
            type: String,
            default: "Unknown",
        },

        responseTime: {
            type: Number,
            default: 0,
        },

        lastChecked: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Monitor", monitorSchema);
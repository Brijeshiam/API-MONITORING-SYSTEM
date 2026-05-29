const cron = require("node-cron");
const axios = require("axios");

const MonitorLog = require("../models/MonitorLog");
const Monitor = require("../models/Monitor");

const sendAlert = require("./alert.service");

const startMonitoring = () => {

    cron.schedule("* * * * *", async () => {

        console.log("Running API checks...");

        try {

            const monitors = await Monitor.find();

            for (const monitor of monitors) {

                const startTime = Date.now();

                try {

                    // API Request
                    await axios({
                        method: monitor.method,
                        url: monitor.url,
                    });

                    const endTime = Date.now();

                    const responseTime = endTime - startTime;

                    // Update monitor
                    monitor.status = "UP";
                    monitor.responseTime = responseTime;
                    monitor.lastChecked = new Date();

                    await monitor.save();

                    // Create log
                    await MonitorLog.create({
                        monitorId: monitor._id,
                        userId: monitor.userId,
                        status: "UP",
                        responseTime: responseTime,
                    });

                    console.log(`${monitor.name} is UP`);

                } catch (error) {

                    // Update monitor
                    monitor.status = "DOWN";
                    monitor.responseTime = 0;
                    monitor.lastChecked = new Date();

                    await monitor.save();

                    // Create log
                    await MonitorLog.create({
                        monitorId: monitor._id,
                        userId: monitor.userId,
                        status: "DOWN",
                        responseTime: 0,
                    });

                    console.log(`${monitor.name} is DOWN`);

                    // Send alert
                    await sendAlert(monitor);
                }
            }

        } catch (error) {

            console.log("Monitoring Error:", error.message);

        }

    });

};

module.exports = startMonitoring;
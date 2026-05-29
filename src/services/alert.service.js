    const nodemailer = require("nodemailer");

let lastAlertTime = {};

const sendAlert = async (monitor) => {
    const now = Date.now();

    // prevent spam (1 alert per 5 min per API)
    if (lastAlertTime[monitor._id] && now - lastAlertTime[monitor._id] < 5 * 60 * 1000) {
        return;
    }

    lastAlertTime[monitor._id] = now;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ALERT_EMAIL,
        subject: `🚨 API DOWN: ${monitor.name}`,
        text: `${monitor.url} is DOWN`,
    });

    console.log("Alert email sent");
};

module.exports = sendAlert;
const nodemailer = require("nodemailer");

const sendEmail = async (subject, text) => {

    try {

        const transporter = nodemailer.createTransport({
            service: "gmail",

            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ALERT_EMAIL,
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);

        console.log("Email Sent");

    } catch (error) {

        console.log(error.message);
    }
};

module.exports = sendEmail;


//for the simple failure alert,we can use this
// await sendEmail(
//                     `API DOWN: ${monitor.name}`,
//                     `${monitor.url} is down is currently down`
//                 )
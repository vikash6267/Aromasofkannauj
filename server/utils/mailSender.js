const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        // Configure transporter with proper Gmail SMTP settings
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify transporter configuration
        await transporter.verify();
        console.log("Mail server is ready to send emails");

        let info = await transporter.sendMail({
            from: `"Aromas of Kannauj" <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body,
        });

        console.log("Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

module.exports = mailSender;

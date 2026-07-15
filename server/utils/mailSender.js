const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        // Check if all required environment variables are set
        if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
            throw new Error("Email configuration is missing. Please set MAIL_HOST, MAIL_USER, and MAIL_PASS environment variables.");
        }

        console.log("Email Config:", {
            host: process.env.MAIL_HOST,
            user: process.env.MAIL_USER,
            hasPassword: !!process.env.MAIL_PASS
        });

        // Configure transporter with proper Gmail SMTP settings
        // Try port 587 first, fallback to 465 if needed
        let transporter = nodemailer.createTransport({
            service: 'gmail', // Using gmail service automatically handles host and port
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
        console.log("✅ Mail server is ready to send emails");

        let info = await transporter.sendMail({
            from: `"Aromas of Kannauj" <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body,
        });

        console.log("✅ Email sent successfully:", info.messageId);
        console.log("Email sent to:", email);
        return info;
    } catch (error) {
        console.error("❌ Email sending failed:", error.message);
        console.error("Full error:", error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

module.exports = mailSender;

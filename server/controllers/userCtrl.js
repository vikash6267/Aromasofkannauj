const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");




const registerMemberCtrl = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check if the user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            });
        }

        // Hash the password and create the user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            name,
            email,

            password: hashedPassword,
        });

        // Generate a JWT token
        const token = jwt.sign(
            { email: user.email, id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        // Set the token in an HTTP-only cookie
        res.cookie("token", token, {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        });

        // Respond with success
        return res.status(201).json({
            success: true,
            token,
            user,
            message: "User registered successfully",
        });
    } catch (error) {
        console.error("REGISTER MEMBER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "User registration failed. Please try again later.",
        });
    }
};




const loginMemberCtrl = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill out all required fields.",
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered. Please sign up to continue.",
            });
        }


        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password.",
            });
        }

        const token = jwt.sign(
            { email: user.email, id: user._id, role: user.role },
            process.env.JWT_SECRET
        );

        user.token = token;
        user.password = undefined; // Remove password from response

        const options = {
            httpOnly: true, // For security purposes
        };

        res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            user,
            message: "User login successful.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again later.",
        });
    }
};

const forgotPasswordCtrl = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide email address",
            });
        }
        
        const user = await userModel.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Your email is not registered with us",
            });
        }
        
        const token = crypto.randomBytes(20).toString("hex");
        
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        
        const clientUrl = process.env.CLIENT_URL || 'https://www.aromasofkannauj.com';
        const resetUrl = `${clientUrl}/reset-password/${token}`;
        
        // Create HTML email template
        const emailBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4a5568; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f7fafc; padding: 30px; border: 1px solid #e2e8f0; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 30px; 
                        background-color: #4299e1; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        margin: 20px 0;
                    }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #718096; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>We received a request to reset your password for your Aromas of Kannauj account.</p>
                        <p>Click the button below to reset your password:</p>
                        <div style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #4299e1;">${resetUrl}</p>
                        <p><strong>This link will expire in 1 hour.</strong></p>
                        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Aromas of Kannauj. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        console.log("Attempting to send reset email to:", email);
        console.log("Reset URL:", resetUrl);
        
        await mailSender(
            email,
            "Password Reset Request - Aromas of Kannauj",
            emailBody
        );
        
        console.log("Password reset email sent successfully to:", email);
        
        return res.json({
            success: true,
            message: "Password reset link has been sent to your email. Please check your inbox.",
        });
    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send reset email. Please try again later.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const resetPasswordCtrl = async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Password reset token is invalid or has expired.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while resetting password",
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select("-password");
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
};

const updateAddressCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const { address } = req.body;
        
        const user = await userModel.findByIdAndUpdate(
            id,
            { address },
            { new: true, runValidators: true }
        ).select("-password");
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.status(200).json({ success: true, user, message: "Address updated successfully" });
    } catch (error) {
        console.error("UPDATE ADDRESS ERROR:", error);
        res.status(500).json({ success: false, message: "Error updating address" });
    }
};

const updateProfileCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone } = req.body;
        
        const user = await userModel.findByIdAndUpdate(
            id,
            { name, phone },
            { new: true, runValidators: true }
        ).select("-password");
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.status(200).json({ success: true, user, message: "Profile updated successfully" });
    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);
        res.status(500).json({ success: false, message: "Error updating profile" });
    }
};

module.exports = { registerMemberCtrl, loginMemberCtrl, forgotPasswordCtrl, resetPasswordCtrl, getAllUsers, updateAddressCtrl, updateProfileCtrl };

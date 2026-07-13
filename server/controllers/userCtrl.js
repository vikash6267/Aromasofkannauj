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
        
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:8080';
        const url = `${clientUrl}/reset-password/${token}`;
        
        console.log(url)
        await mailSender(
            email,
            "Password Reset Link",
            `Password Reset Link: ${url}`
        );
        
        return res.json({
            success: true,
            message: "Email sent successfully, please check email and change password",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while sending email",
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

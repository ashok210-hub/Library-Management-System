const User=require('../models/userModal');
const jwt=require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto=require('crypto');
const dotenv=require('dotenv');
dotenv.config();

const sendVerificationCode = require('../utils/sendVerificationCode');
const sendToken = require('../utils/sendToken');
const { generatePasswordResetEmailTemplate } = require('../utils/emailTemplates');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('sequelize');


class AuthController {

  
  async registerUser(req, res) {
    try {
        console.log(" Request Body:", req.body);
        const { name, email, password } = req.body;

        // Validate input fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please fill in all fields." });
        }

        // Validate password length
        if (password.length < 8 || password.length > 16) {
            return res.status(400).json({ message: "Password must be between 8 and 16 characters." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Limit registration attempts for unverified users
        const attempts = await User.count({ where: { email, accountVerified: false } });
        if (attempts >= 5) {
            return res.status(400).json({ message: "Too many registration attempts. Try again later." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification code
        const verificationCode = await User.generateVerificationCode();

        // Create new user
        const user = await User.create({
            name, email, password: hashedPassword, role: "User", verificationCode
        });

        // Send verification code via email
        const emailSent = await sendVerificationCode(verificationCode, email);
        if (!emailSent) {
            console.error("Failed to send verification email.");
        }

        console.log("User registered successfully!");
        return res.status(201).json({
            status: true,
            message: "User registered successfully. Verification email sent.",
            user,
        });

    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ status: false, message: "Error registering user." });
    }
  }


  async verifyOTP(req, res) {
    try {
        const { email, verificationCode } = req.body;
  
        // Validate input fields
        if (!email || !verificationCode) {
            return res.status(400).json({ message: "Email and verification code are required" });
        }
  
        // Find user by email
        const user = await User.findOne({ where: { email } });
  
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
  
        // Convert both to numbers before comparing
        if (Number(verificationCode) !== Number(user.verificationCode)) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
  
        // Update user account verification status
        await User.update(
            { verificationCode: null, accountVerified: true },
            { where: { email } }
        );
  
        console.log(" User verified successfully:", email);
        return res.status(200).json({ status: true, message: "User account verified successfully." });
  
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(error.status || 500).json({ status: false, message: error.message || "Server Error" });
    }
  }
  
  async getUser(req, res) {
    try {
      if (!req.user) {
        console.log("Unauthorized access attempt");
        return res.status(401).json({ status: false, message: "Unauthorized." });
      }
  
      console.log("User data retrieved:", req.user.email); 
      return res.status(200).json({ status: true, message: "User data retrieved successfully.", data: req.user });
  
    } catch (error) {
      console.error("Error retrieving user data:", error);
      return res.status(500).json({ status: false, message: "Server error. Please try again later." });
    }
  }
  


  async login(req, res) {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user with a verified account
        const user = await User.findOne({ where: { email, accountVerified: true } });

        // If user does not exist, return error
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check password validity
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Send token on successful login
        sendToken(user, 200, res, "Login successful.");

    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({ status: false, message: "Server error. Please try again later." });
    }
  }

  async logout(req, res) {
    try {
        
        res.cookie("token", "", {
            expires: new Date(0), 
            httpOnly: true,
            
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });

    } catch (error) {
        console.error(" Error in logout:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
  }

  async forgotPassword(req, res) {
      try {
          console.log("Request Body:", req.body);
          const { email } = req.body;
  
          // Validate input
          if (!email) {
              return res.status(400).json({ message: "Email is required" });
          }
  
          // Find user
          const user = await User.findOne({ where: { email, accountVerified: true } });
          if (!user) {
              return res.status(404).json({ message: "User not found" });
          }
  
          // Generate secure reset token
          const resetToken = crypto.randomBytes(32).toString("hex");
          const resetTokenHashed = crypto.createHash("sha256").update(resetToken).digest("hex");
  
          // Set token expiry (15 minutes)
          user.resetPasswordToken = resetTokenHashed;
          user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  
          // Save token to database
          await user.save();
  
          // Create reset password URL
          const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
          console.log("Reset Password URL:", resetPasswordUrl);
  
          // Generate email template and send email
          const message = generatePasswordResetEmailTemplate(resetPasswordUrl);
          await sendEmail({
              email: user.email,
              subject: "Library Management System Password Recovery",
              message,
          });
  
          return res.status(200).json({ success: true, message: "Reset password email sent successfully." });
  
      } catch (error) {
          console.error("Error in forgotPassword function:", error);
          return res.status(500).json({ message: "Server error. Please try again later." });
      }
  }
  
  async resetPassword(req, res) {
      try {
          const { token } = req.params;
          const { newPassword, confirmPassword } = req.body;
  
          // Validate input fields
          if (!newPassword || !confirmPassword) {
              return res.status(400).json({ message: "New password and confirm password are required." });
          }
  
          // Ensure password length is valid
          if (newPassword.length < 8 || newPassword.length > 16) {
              return res.status(400).json({ message: "Password must be between 8 and 16 characters." });
          }
  
          // Ensure passwords match
          if (newPassword !== confirmPassword) {
              return res.status(400).json({ message: "Passwords do not match." });
          }
  
          // Hash the incoming reset token
          const resetTokenHashed = crypto.createHash("sha256").update(token).digest("hex");
  
          // Find user with matching token and check expiration
          const user = await User.findOne({
              where: {
                  resetPasswordToken: resetTokenHashed,
                  resetPasswordExpire: { [Op.gt]: Date.now() }
              }
          });
  
          // If no user found, return error
          if (!user) {
              return res.status(400).json({ message: "Invalid or expired token." });
          }
  
          // Hash new password
          const hashedPassword = await bcrypt.hash(newPassword, 10);
  
          // Update user password and clear reset token fields
          await user.update({
              password: hashedPassword,
              resetPasswordToken: null,
              resetPasswordExpire: null
          });
  
          // Send success response
          return sendToken(user, 200, res, "Password Reset Successful");
  
      } catch (error) {
          console.error("Error resetting password:", error);
          return res.status(500).json({ message: "Server error. Please try again later." });
      }
  }
  
  

  async updatePassword(req, res) {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate input fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "Please provide both old and new passwords." });
        }

        // Ensure new passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        // Validate password length
        if (newPassword.length < 8 || newPassword.length > 16) {
            return res.status(400).json({ message: "Password must be between 8 and 16 characters." });
        }

        // Find user
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if old password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect old password." });
        }

        // Hash and update new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ success: true, message: "Password updated successfully." });

    } catch (error) {
        console.error(" Error updating password:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
  }

}







module.exports=new AuthController();
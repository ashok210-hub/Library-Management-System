const User=require('../models/userModal');
const bcrypt = require('bcrypt');
const sendVerificationCode = require('../utils/sendVerificationCode');
class UserController {
    async getAllUsers(req, res) {
        try {
            
            const users = await User.findAll({});
    
            return res.status(200).json({
                success: true,
                message: "Successfully retrieved users.",
                users,
            });
    
        } catch (error) {
            console.error(" Error fetching users:", error);
            return res.status(500).json({ success: false, message: "Server error. Please try again later." });
        }
    }
    
    async registerNewAdmin(req, res) {
        try {
            const { name, email, password } = req.body;
    
            // Validate input fields
            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: "Name, Email, and Password are required." });
            }
    
            // Validate password length before making database calls
            if (password.length < 8 || password.length > 16) {
                return res.status(400).json({ message: "Password must be between 8 and 16 characters." });
            }
    
            // Check if user already exists
            const userExist = await User.findOne({ where: { email } });
            if (userExist) {
                return res.status(400).json({ success: false, message: "Email already exists." });
            }
    
            // Limit registration attempts for unverified users
            const registrationAttemptsByUser = await User.count({ where: { email, accountVerified: false } });
            if (registrationAttemptsByUser >= 5) {
                return res.status(400).json({ message: "Too many registration attempts. Try again later." });
            }
    
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Generate verification code
            const verificationCode = await User.generateVerificationCode();
    
            // Create new admin user
            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: "Admin",
                verificationCode,
            });
    
            // Send verification code via email
            const emailSent = await sendVerificationCode(verificationCode, email);
            if (!emailSent) {
                return res.status(500).json({ status: false, message: "Verification email failed to send." });
            }
    
            console.log(" Admin registered successfully!");
            return res.status(201).json({
                status: true,
                message: "Admin registered successfully. Verification email sent.",
                user,
            });
    
        } catch (error) {
            console.error("Error registering new admin:", error);
            return res.status(500).json({ status: false, message: "Error registering new admin." });
        }
    }
};    

module.exports= new UserController();
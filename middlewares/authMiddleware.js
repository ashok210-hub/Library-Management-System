const jwt = require("jsonwebtoken");
const User = require("../models/userModal");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Middleware to check if the user is authenticated
 */
exports.isAuthenticated = async (req, res, next) => {
    try {
        // Get token from cookies
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: "Please login to access this resource." });
        }

        // Verify Token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (error) {
            console.error(" JWT Verification Failed:", error.message);
            return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
        }

        // Get user from database
        const userData = await User.findByPk(decoded.id);
        if (!userData) {
            return res.status(404).json({ message: "User not found. Please log in again." });
        }

        req.user = userData;
        console.log(` User authenticated: ${req.user.email}`);

        next(); // Proceed to the next middleware

    } catch (error) {
        console.error(" Authentication Middleware Error:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

/**
 * Middleware to check if the user is authorized to access a specific route
 */
exports.isAuthorized = (...roles) => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user || !req.user.role) {
                return res.status(403).json({ message: "Unauthorized access. No role found." });
            }

            console.log(` Checking authorization: Required roles - ${roles.join(", ")}`);

            // Check if user has the required role
            if (!roles.includes(req.user.role)) {
                console.warn(" Access Denied: Insufficient permissions.");
                return res.status(403).json({ message: "You do not have permission to access this resource." });
            }

            next(); // Proceed to the next middleware

        } catch (error) {
            console.error(" Authorization Middleware Error:", error);
            return res.status(500).json({ message: "Server error. Please try again later." });
        }
    };
};

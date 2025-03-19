const express = require("express");
const authController = require("../controllers/authController.js");
const { isAuthenticated } = require("../middlewares/authMiddleware.js");

const router = express.Router();

// Utility function for handling async errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Public Routes (No Authentication Required)
router.post("/register", asyncHandler(authController.registerUser));
router.post("/verify-email", asyncHandler(authController.verifyOTP));
router.post("/login", asyncHandler(authController.login));
router.post("/forgot-password", asyncHandler(authController.forgotPassword));
router.put("/reset-password/:token", asyncHandler(authController.resetPassword));

// Protected Routes (Authentication Required)
router.use(isAuthenticated);

router.get('/me', asyncHandler(authController.getUser));
router.post('/logout', asyncHandler(authController.logout));
router.put("/update-password", asyncHandler(authController.updatePassword));

module.exports = router;

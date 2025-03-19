const express = require("express");
const { isAuthenticated, isAuthorized } = require("../middlewares/authMiddleware");
const UserController = require("../controllers/userController");

const router = express.Router();

// Utility function for handling async errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply authentication to all routes
router.use(isAuthenticated);

// Admin-only routes
router.use(isAuthorized("Admin"));
router.get('/getAllUsers', asyncHandler(UserController.getAllUsers));
router.post("/registerNewAdmin", asyncHandler(UserController.registerNewAdmin));

module.exports = router;

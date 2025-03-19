const express = require("express");
const { isAuthenticated, isAuthorized } = require("../middlewares/authMiddleware");
const BookController = require("../controllers/bookController");

const router = express.Router();

// Utility function for handling async errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply authentication to all routes
router.use(isAuthenticated);

// Book routes
router.post("/createBook", isAuthorized("Admin"), asyncHandler(BookController.createBook));
router.get("/getBooks", asyncHandler(BookController.getBooks));
router.get("/getBook/:id", asyncHandler(BookController.getBookById));
router.put("/updateBook/:id", isAuthorized("Admin"), asyncHandler(BookController.updateBook));
router.delete("/deleteBook/:id", isAuthorized("Admin"), asyncHandler(BookController.deleteBook));

module.exports = router;

const express = require("express");
const BorrowController = require("../controllers/borrowController");
const { isAuthenticated, isAuthorized } = require("../middlewares/authMiddleware");

const router = express.Router();

// Utility function for handling async errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply authentication to all routes
router.use(isAuthenticated);

// Borrow and Return Books (Only Authenticated Users)
router.post("/borrowBook", asyncHandler(BorrowController.borrowBook));
router.patch("/returnBook/:borrowId", asyncHandler(BorrowController.returnBook));
router.get("/getBorrowListByUser", asyncHandler(BorrowController.getBorrowListByUser));

// Admin & Librarian Only Routes
router.use(isAuthorized("Admin", "Librarian"));
router.get("/getBorrow/:borrowId", asyncHandler(BorrowController.getBorrow));
router.get("/getBorrowList", asyncHandler(BorrowController.getBorrowList));
router.get("/getBorrowListByBook/:bookId", asyncHandler(BorrowController.getBorrowListByBook));

module.exports = router;

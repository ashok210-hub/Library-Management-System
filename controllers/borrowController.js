const Borrow=require('../models/borrowModel.js');
const Book = require('../models/bookModel.js');
const User = require('../models/userModal.js');
class BorrowController{
    // Borrow a Book (Only Authenticated Users)
    async borrowBook(req, res) {
        try {
            const { bookId, dueDate } = req.body;
            const userId = req.user.id; // Get authenticated user ID
    
            // Validate input
            if (!bookId || !dueDate) {
                return res.status(400).json({ success: false, message: "Missing required fields." });
            }
    
            // Check if the book exists
            const book = await Book.findByPk(bookId);
            if (!book) {
                return res.status(404).json({ success: false, message: "Book not found." });
            }
    
            // Ensure the book has available copies
            if (book.quantity <= 0) {
                return res.status(400).json({ success: false, message: "No copies available for borrowing." });
            }
    
            // Ensure due date is valid (must be in the future)
            if (new Date(dueDate) <= new Date()) {
                return res.status(400).json({ success: false, message: "Due date must be in the future." });
            }
    
            // Fetch the correct book price from the database
            const bookPrice = book.price;
    
            // Create borrow record
            const borrow = await Borrow.create({
                userId,
                userName: req.user.name,
                userEmail: req.user.email,
                bookId,
                bookPrice,
                borrowDate: new Date(),
                dueDate,
                status: "Borrowed",
            });
    
            // Reduce the available quantity of the book
            await book.update({ quantity: book.quantity - 1 });
    
            return res.status(201).json({ success: true, message: "Book borrowed successfully.", borrow });
    
        } catch (error) {
            console.error("Error borrowing book:", error);
            return res.status(500).json({ success: false, message: "Internal server error." });
        }
    }
    
    // Return a Book (Only Authenticated Users)
    async returnBook(req, res) {
        console.log("req.params",req.params,"req.params.borrowId", req.params.borrowId)
        console.log('req from the return book APi :',req);
        try {
            const  borrowId  = req.params.borrowId;
    
            // Check if borrow record exists
            const borrow = await Borrow.findByPk(borrowId);
            if (!borrow) {
                return res.status(404).json({ success: false, message: "Borrow record not found." });
            }
    
            // Remove time from today's date for accurate comparison
            const today = new Date();
            today.setHours(0, 0, 0, 0);
    
            // Calculate fine if overdue
            let fine = 0;
            const dueDate = new Date(borrow.dueDate);
            if (dueDate < today) {
                const daysLate = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
                const finePerDay = process.env.FINE_PER_DAY || 2; 
                fine = daysLate * finePerDay;
            }
    
            // Update borrow record
            await borrow.update({
                returnDate: today,
                fine,
                status: "Returned"
            });
    
            // Increase book quantity after returning
            const book = await Book.findByPk(borrow.bookId);
            if (book) {
                await book.update({ quantity: book.quantity + 1 });
            }
    
            return res.status(200).json({ success: true, message: "Book returned successfully.", borrow });
    
        } catch (error) {
            console.error("Error returning book:", error);
            return res.status(500).json({ success: false, message: "Internal server error." });
        }
    }
    

    // Get Single Borrow Record (Only Admins/Librarians)
    async getBorrow(req, res) {
        try {
            const borrowId = req.params.borrowId;

            // Validate borrowId before querying
            if (!borrowId) {
                return res.status(400).json({ success: false, message: "Invalid borrow ID." });
            }

            // Fetch borrow record with associated user & book details
            const borrow = await Borrow.findByPk(borrowId, {
                include: [
                    { model: User, attributes: ["id", "name", "email"] },
                    { model: Book, as: "book", attributes: ["book_id"] }
                ]
            });
    
            if (!borrow) {
                return res.status(404).json({ success: false, message: "Borrow record not found." });
            }
    
            return res.status(200).json({ success: true, borrow });
    
        } catch (error) {
            console.error("Error fetching borrow record:", error.message);
            return res.status(500).json({ success: false, message: "Error retrieving borrow record. Please try again." });
        }
    }
    

    // Get All Borrowed Books (Only Admins/Librarians)
    async getBorrowList(req, res) {
        try {
            const borrows = await Borrow.findAll({
                // attributes: ["id", "borrowDate", "dueDate", "returnDate", "status"],
                include: [
                    { model: User, as: "user", attributes: ["id", "name", "email"] },
                    { model: Book, as: "book", attributes: ["book_id"] }
                ],
                order: [["borrowDate", "DESC"]] // Sort by latest borrow date
            });
    
            if (!borrows.length) {
                return res.status(404).json({ success: false, message: "No borrow records found." });
            }
    
            return res.status(200).json({ success: true, borrows });
    
        } catch (error) {
            console.error("Error fetching borrow list:", error.message);
            return res.status(500).json({ success: false, message: "Internal server error." });
        }
    }
    

    // Get Borrowed Books by User (Only Authenticated Users)
    async getBorrowListByUser(req, res) {
        try {
            const userId = req.user.id;
            console.log(' User ID:', userId);
    
            // Fetch borrow records for the user 
            const borrows = await Borrow.findAll({
                where: { userId: userId},
              
                order: [["borrowDate", "DESC"]] 
            });
            console.log(' Borrow List by User:', borrows);
    
            if (!borrows.length) {
                return res.status(404).json({ success: false, message: "No borrow records found." });
            }
            console.log(' Borrow List:', borrows);
    
            return res.status(200).json({ success: true, borrows });
    
        } catch (error) {
            console.error("Error fetching borrow list by user:", error.message);
            return res.status(500).json({ success: false, message: "Internal server error." });
        }
    }
    

    // Get Borrowed Books by Book (Only Admins/Librarians)
    async getBorrowListByBook(req, res) {
        try {
            const { bookId } = req.params;
    
            // Validate bookId
            if (!bookId ) {
                return res.status(400).json({ success: false, message: "Invalid book ID." });
            }
    
            // Fetch borrow records for the book
            const borrows = await Borrow.findAll({
                where: { bookId: bookId },
                include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
                order: [["borrowDate", "DESC"]] // Sort by most recent borrow date
            });
    
            if (!borrows.length) {
                return res.status(404).json({ success: false, message: "No borrow records found for this book." });
            }
    
            return res.status(200).json({ success: true, borrows });
    
        } catch (error) {
            console.error("Error fetching borrow list by book:", error.message);
            return res.status(500).json({ success: false, message: "Internal server error." });
        }
    }
    

};
module.exports=new BorrowController();
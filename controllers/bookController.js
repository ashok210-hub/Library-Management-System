const Book = require("../models/bookModel");

class BookController {

    // Create a new book
    createBook = async (req, res, next) => {
        try {
            const { title, author, description, price, quantity } = req.body;

            if (!title || !author || !description || !price || !quantity) {
                return next(new Errorhandler("Please fill in all fields", 400));
            }

            const book = await Book.create({ title, author, description, price, quantity });

            res.status(201).json({
                success: true,
                message: "Book created successfully",
                book
            });
        } catch (error) {
            console.error("Error creating book:", error);
            return next(error);
        }
    };

    // Update book details
    updateBook = async (req, res, next) => {
        try {
            const { id } = req.params;
    
            // Validate book ID presence
            if (!id) {
                return res.status(400).json({ success: false, message: "Please provide a valid book id" });
            }
    
            // Check for update fields
            if (Object.keys(req.body).length === 0) {
                return res.status(400).json({ success: false, message: "No fields provided for update" });
            }
    
            // Check if the book exists
            const bookExists = await Book.findByPk(id); 
            if (!bookExists) {
                return res.status(404).json({ success: false, message: "Book not found" });
            }
    
            // Perform the update
            const [updated] = await Book.update(req.body, { where: { book_id: id } });
    
            // If no rows were updated, return an appropriate message
            if (updated === 0) {
                return res.status(404).json({ success: false, message: "Book update failed, no changes detected" });
            }
    
            // Fetch the updated book
            const updatedBook = await Book.findByPk(id); 
    
            res.status(200).json({
                success: true,
                message: "Book updated successfully",
                book: updatedBook
            });
        } catch (error) {
            console.error("Error updating book:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    };
    // Delete a book
    deleteBook = async (req, res, next) => {
        try {
            const deletedBook = await Book.destroy({ where: { book_id: req.params.id } });

            if (!deletedBook) {
                return res.status(404).json({ success: false, message: "Book not found" });
            }

            res.status(200).json({
                success: true,
                message: "Book deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting book:", error);
            return res.status(400).json({ status: false, message: error.message });
        }
    };

    // Get all books
    getBooks = async (req, res, next) => {
        try {
            const books = await Book.findAll();
            res.status(200).json({
                success: true,
                message: "Books retrieved successfully",
                books
            });
        } catch (error) {
            console.error("Error retrieving books:", error);
            return res.status(500).json({ status: false, message: error.message });
        }
    };

    // Get a single book by ID
    getBookById = async (req, res, next) => {
        try {
            if (isNaN(req.params.id)) {
                return res.status(400).json({ success: false, message: "Invalid book ID" });
            }

            const book = await Book.findByPk(req.params.id);

            if (!book) {
                return res.status(404).json({ success: false, message: "Book not found" });
            }

            res.status(200).json({ success: true, message: "Book retrieved successfully", book });
        } catch (error) {
            console.error("Error retrieving book:", error);
            return res.status(500).json({ status: false, message: error.message });
        }
    };
}

module.exports = new BookController();

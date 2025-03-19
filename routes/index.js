const express = require('express');
const router = express.Router();

const authRouter = require('./authRouter');
const bookRouter = require('./bookRouter');
const borrowRouter = require('./borrowRouter');
const userRouter = require('./userRouter');

// API Routes
router.use('/api/auth', authRouter);
router.use('/api/books', bookRouter);  
router.use('/api/borrows', borrowRouter); 
router.use('/api/users', userRouter); 

module.exports = router;

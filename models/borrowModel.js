const { Sequelize } = require("sequelize");
const sequelize = require("../database/db_connection");
const User = require('../models/userModal');
const Book = require('../models/bookModel');

const Borrow = sequelize.define(
    "borrows", 
    {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        userId: {
            type: Sequelize.BIGINT,
            allowNull: false,
            foreignKey: true
        },
        userName: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        userEmail: {
            type: Sequelize.STRING(100),
            allowNull: false,
            validate: { isEmail: true },
        },
        bookId: {
            type: Sequelize.BIGINT,
            allowNull: false,
            foreignKey: true
        },
        bookPrice: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            validate: { min: 0 },
        },
        borrowDate: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        dueDate: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        returnDate: {
            type: Sequelize.DATEONLY,
            allowNull: true,
        },
        fine: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
            validate: { min: 0 },
        },
        notified: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        status: {
            type: Sequelize.ENUM("borrowed", "returned"),
            allowNull: false,
        },
    },
    {
        sequelize, 
        timestamps: true, 
        paranoid: true, 
        tableName: "borrows", 
    }
);

//  Define associations
// Borrow.associate = (models) => {
//     Borrow.belongsTo(models.Book, { foreignKey: "bookId", onDelete:'CASCADE' }); 
//     Borrow.belongsTo(models.User, { foreignKey: "userId", onDelete: 'CASCADE'}); 
// };


Borrow.belongsTo(User, { foreignKey: "userId", onDelete:'CASCADE' }); 
User.hasMany(Borrow, { foreignKey: "userId", onDelete:'CASCADE' }); 

Borrow.belongsTo(Book, { foreignKey: "bookId", onDelete: 'CASCADE'}); 
Book.hasMany(Borrow, { foreignKey: "bookId", onDelete: 'CASCADE'}); 


module.exports = Borrow;

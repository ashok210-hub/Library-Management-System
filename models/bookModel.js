const { Sequelize } = require("sequelize");
const sequelize = require("../database/db_connection");

const Book = sequelize.define(
    "books",
    {
        book_id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        title: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        author: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        publication_date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
        },
        price: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        image: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM("Active", "Inactive"),
            defaultValue: "Active",
            allowNull: false,
        },
    },
    {
        timestamps: true, 
        paranoid: true, 
    }
);

module.exports = Book;

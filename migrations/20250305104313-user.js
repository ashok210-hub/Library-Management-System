'use strict';
const { TIMESTAMP } = require('mysql/lib/protocol/constants/types');
const Sequelize=require('sequelize');
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable('users', {
     id: {
            type: Sequelize.BIGINT,
            autoIncrement:true,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        role: {
            type: Sequelize.ENUM("Admin", "Librarian", "User"),
            defaultValue: "User",
             
        },
        accountVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        verificationCode: {
            type: Sequelize.STRING,
            allowNull: true
        },
        verificationCodeExpire:{
            type: Sequelize.DATE,
            allowNull: true
        },
        resetPasswordToken: {
            type: Sequelize.STRING,
            allowNull: true
        },
        resetPasswordExpire: {
            type: Sequelize.DATE,
            allowNull: true
        },
        createdAt:{
            type:Sequelize.DATE,
            allowNull:false,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
        },
        updatedAt:{
            type:Sequelize.DATE,
            allowNull:false,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
        },
        deletedAt:{
            type:Sequelize.DATE,
            allowNull:true
        },

    },
    {
        timestamps: true, 
        paranoid: true
    }
);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('users')
  }
};

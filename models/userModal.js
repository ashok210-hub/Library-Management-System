const { Sequelize } = require('sequelize');
const sequelize = require('../database/db_connection.js');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const dotenv=require('dotenv');

dotenv.config();
const User = sequelize.define("users", {
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
        defaultValue: "User"
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
},
{
    timestamps: true, // Automatically adds createdAt & updatedAt
    paranoid: true,
   
}
);
// Generate a 5-digit verification code 
User.generateVerificationCode=function (){
    function generateRandomFiveDigitNumber() {
    const firstDigit= Math.floor(Math.random()*9)+1;
    const remainingDigits= Math.floor(Math.random()*10000)
    .toString()
    .padStart(4, '0');
    return parseInt(firstDigit+ remainingDigits);
}
const verificationCode=generateRandomFiveDigitNumber();
this .verificationCode=verificationCode;
this .verificationCodeExpire = Date.now()+15*60*1000 // 15 minute from now
return verificationCode;
};

User.getResetPasswordToken=function(){
    // Generate a token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set expiration time (15 min)
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return  resetToken;
  
};
// add this method inside the User model
User.generateToken = function () { 
    return jwt.sign({ id:this.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  };

module.exports = User;

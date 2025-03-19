// const jwt=require('jsonwebtoken');
// const User = require('../models/userModel');
// 
// const sendToken = (user, statusCode, res, message) => {
// 
//   if (!user || !user.id) {
//     return res.status(500).json({ success: false, message: "User not found. Cannot generate token." });
//   }
//     const token =User.generateToken();
// 
//   
//     // Set cookie options
//     const options = {
//       expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
//       httpOnly: true,
//     };
//   
//     res.status(statusCode).cookie("token", token, options).json({
//       success: true,
//       message,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//       token,
//     });
//   };
//   
//   module.exports = sendToken;

const jwt = require("jsonwebtoken");

const sendToken = (user, statusCode, res, message) => {
  if (!user || !user.id) {
    return res.status(500).json({ success: false, message: "User not found. Cannot generate token." });
  }

  // Generate token with user details
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  // Set cookie options
  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    token, // User data is inside the token, so no separate user object is needed
  });
};

module.exports = sendToken;

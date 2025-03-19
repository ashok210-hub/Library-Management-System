function generateVerificationOtpEmailTemplate(OtpCode){
    return `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Thank you for signing up! Please use the verification code below to verify your email address.</p>
            <div style="font-size: 20px; font-weight: bold; padding: 10px; background: #f4f4f4; display: inline-block; border-radius: 5px;">
                ${OtpCode}
            </div>
            <p>This code is valid for <strong>10 minutes</strong>.</p>
            <p>If you did not request this, please ignore this email.</p>
            <hr>
            <p style="font-size: 12px; color: #777;">Library Management System &copy; ${new Date().getFullYear()}</p>
        </div>`
};

function generatePasswordResetEmailTemplate(resetPasswordUrl){
    return `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetPasswordUrl}" target="_blank">${resetPasswordUrl}</a>
    <p>This link will expire in 15 minutes.</p>
  `;

};

module.exports= {generateVerificationOtpEmailTemplate, generatePasswordResetEmailTemplate};
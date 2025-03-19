const { generateVerificationOtpEmailTemplate } = require("./emailTemplates");
const sendEmail = require("./sendEmail");

// Function to send a verification code via email
async function sendVerificationCode(verificationCode, email) {
    try {
        const message = generateVerificationOtpEmailTemplate(verificationCode);
        
        const isSent = await sendEmail({
            email,
            subject: "Verification Code (Bookworm Library Management System)",
            message,
        });

        if (isSent) {
            console.log(` Verification code sent successfully to ${email}!`);
        } else {
            console.warn(` Failed to send verification code to ${email}.`);
        }

        return isSent;

    } catch (error) {
        console.error(" Error sending verification code:", error);
        return false;
    }
}

module.exports = sendVerificationCode;

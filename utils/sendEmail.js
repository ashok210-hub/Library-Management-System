const nodeMailer=require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
// create a single reusable transporter
const transporter=nodeMailer.createTransport({
    host:process.env.SMTP_HOST,
    port:process.env.SMTP_PORT,
    service:process.env.SMTP_SERVICE,
    auth:{
        user:process.env.SMTP_MAIL,
        pass:process.env.SMTP_PASSWORD,
    }
});
// Function to send email
const sendEmail=async ({email,subject,message})=>{
    try {
        const mailOptions={
            from:process.env.SMTP_MAIL,
            to:email,
            subject:subject,
            html: message,
        }
        // await transporter.sendMail(mailOptions);
        const info=await transporter.sendMail(mailOptions);
        console.log(` Email sent to ${email} with message ${ message}`);
        return info;
    } catch (error) {
        console.error(` Error sending email to ${email} : ${error}`);
        return false;
    }
};

module.exports= sendEmail;


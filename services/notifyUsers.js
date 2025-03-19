const cron = require('node-cron');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { Op } = require("sequelize");
const Borrow = require("../models/borrowModel");  
const User = require("../models/userModal");

dotenv.config();

// Setup Nodemailer Transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
    }
});

// Function to send email reminders
const sendReminderEmail = async (user, borrow) => {
    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: user.email,
        subject: 'Reminder: Return Book',
        text: `Dear ${user.name},\n\nYour borrowed book (ID: ${borrow.bookId}) is overdue. Please return it as soon as possible.\n\nThank you!\nLibrary Management System`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(` Reminder email sent to ${user.email}`);
    } catch (error) {
        console.error(' Error sending reminder email:', error);
    }
};

// Function to notify users of overdue books
const notifyUsers = async () => {
    try {
        console.log(' Notifying users of overdue books...');

        // Get all overdue books
        const overdueBorrows = await Borrow.findAll({
            where: {
                dueDate: { [Op.lt]: new Date() },
                status: "borrowed"
            },
            include: [{ model: User, as: "user" }]
        });

        // Send reminder emails in parallel
        if (overdueBorrows.length > 0) {
            await Promise.all(overdueBorrows.map(borrow => sendReminderEmail(borrow.user, borrow)));
            console.log(` Sent ${overdueBorrows.length} reminder emails.`);
        } else {
            console.log(" No overdue books found.");
        }

    } catch (error) {
        console.error(' Error notifying users of overdue books:', error);
    }
};

// Schedule task to run every day at 9 AM
cron.schedule("0 9 * * *", async () => {
    try {
        console.log(' Running a task every day at 9:00 AM...');
        await notifyUsers();
    } catch (error) {
        console.error(' Cron Job Error:', error);
    }
});

module.exports = { sendReminderEmail, notifyUsers };

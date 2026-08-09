const nodemailer = require('nodemailer');
require("dotenv").config();

// Create a real Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error("Gmail SMTP Connection Error:", error);
    } else {
        console.log("Gmail SMTP Server is ready to take our messages");
    }
});

module.exports = transporter;
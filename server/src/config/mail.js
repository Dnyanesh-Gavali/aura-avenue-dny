const nodemailer = require('nodemailer');
const dns = require('dns');
require("dotenv").config();

// FIX: Force Node.js to resolve IPv4 addresses first to prevent ENETUNREACH IPv6 errors
dns.setDefaultResultOrder('ipv4first');

// Create the transporter using explicit host and port settings
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for port 465 (SSL)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Optional but helps prevent local certificate chain issues
    tls: {
        rejectUnauthorized: false
    }
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error("Gmail SMTP Connection Error:", error);
    } else {
        console.log("Gmail SMTP Server is ready to send OTPs using IPv4!");
    }
});

module.exports = transporter;
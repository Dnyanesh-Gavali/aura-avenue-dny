const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,             // Changed from 465 to 587
    secure: false,         // MUST be false when using port 587
    requireTLS: true,      // Forces TLS encryption
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Helps bypass strict cert checks in Render containers
    }
});

module.exports = transporter;

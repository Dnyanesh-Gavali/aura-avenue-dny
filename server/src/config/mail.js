const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,             // Use 587, not 465
    secure: false,         // MUST be false for 587 (it upgrades to secure automatically)
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Bypasses Render's strict container certificates
    }
});

module.exports = transporter;

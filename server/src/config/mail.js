const nodemailer = require("nodemailer");

/**
 * 
 * this module sets up a mail transporter using Nodemailer with Gmail service. It uses environment variables for authentication credentials (EMAIL_USER and EMAIL_PASS). The transporter is exported for use in other parts of the application to send emails.
 * @module mail
 * @requires nodemailer
 * @returns {Object} transporter - Nodemailer transporter object for sending emails
 */


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports = transporter;

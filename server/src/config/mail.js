const { Resend } = require('resend');

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// We create a fake "transporter" so you don't have to rewrite your other files!
const transporter = {
    sendMail: async (mailOptions) => {
        try {
            const data = await resend.emails.send({
                // Note: On Resend's free tier, you MUST send FROM this exact email:
                from: import.meta.env.EMAIL_USER, 
                to: mailOptions.to,
                subject: mailOptions.subject,
                html: mailOptions.html,
                text: mailOptions.text
            });
            console.log("Email sent successfully via Resend!", data);
            return data;
        } catch (error) {
            console.error("Resend API Error:", error);
            throw error;
        }
    }
};

module.exports = transporter;
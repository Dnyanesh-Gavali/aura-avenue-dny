const transporter = require("../config/mail");

/**
 * 
 * this module provides services related to OTP generation and sending. It includes functions to generate a random OTP, store it in the database, and send it via email using Nodemailer. The sendOtp function checks if the email belongs to an admin or developer and sends a notification accordingly.
 * @module otpService
 * @requires ../config/mail
 * @requires ../config/db
 * @returns {Object} - Functions for OTP generation and sending
 */

const { collectionOtps } = require("../config/db");

async function generateOtp(email) {

    // Purane OTP delete
    await collectionOtps.deleteMany({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await collectionOtps.insertOne({
        email,
        otp,
        createdAt: new Date()
    });

    return otp;
}

async function sendOtp(email) {
    try {
        const normalizedEmail = email.trim().toLowerCase();

        // 1. Check if target email belongs to Admin/Developer
        const isAdminEmail = /^admin(\d+)?@aura\.com$/i.test(normalizedEmail);

        // 2. Generate OTP Code
        const otp = await generateOtp(normalizedEmail);

        // 3. IF Admin Email -> Send Security Alert to Organization
       if (isAdminEmail) {
            const adminAlertOptions = {
                from: `"AuraAvenue" <${process.env.EMAIL_USER}>`, // MUST use this for Resend free tier
                to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                subject: "🚨 Alert: Admin OTP Code Generated",
                text: `An OTP code was generated for Admin account: ${normalizedEmail}.\nGenerated Code: ${otp}`,
                html: `
                    <div style="font-family: sans-serif; padding: 16px; border: 2px solid #ef4444; border-radius: 8px;">
                        <h3 style="color: #ef4444; margin-top: 0;">🚨 System Alert: Admin Login / Account Activity</h3>
                        <p>An OTP code was requested for the admin account: <b>${normalizedEmail}</b>.</p>
                        <p><b>Generated OTP:</b> <span style="font-family: monospace; font-size: 18px; font-weight: bold;">${otp}</span></p>
                        <p style="font-size: 12px; color: #64748b;">This notification is sent to inform the organization of administrative authentication attempts.</p>
                    </div>
                `
            };

           const info = await transporter.sendMail(adminAlertOptions);
            return info;

        } else {
            // 4. ELSE (Normal User) -> Send Standard User OTP Email
           const userMailOptions = {
                from: 'AuraAvenue <onboarding@resend.dev>', // MUST use this for Resend free tier
                to: normalizedEmail,
                subject: "Your OTP Verification Code - AuraAvenue",
                text: `Your OTP code is: ${otp}. This code is valid for 5 minutes.`,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; color: #1e293b;">
                        
                        <!-- Header -->
                        <div style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
                            <h2 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">AuraAvenue</h2>
                            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">Security Verification</p>
                        </div>

                        <!-- Body -->
                        <div style="padding: 28px 24px; text-align: center;">
                            <p style="margin-top: 0; font-size: 15px; color: #475569;">Hello,</p>
                            <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 24px;">
                                Use the following One-Time Password (OTP) to complete your account verification.
                            </p>

                            <!-- OTP Box -->
                            <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 18px; margin: 20px 0; display: inline-block; width: 80%;">
                                <span style="font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: 8px; font-family: monospace;">${otp}</span>
                            </div>

                            <p style="font-size: 12px; color: #ef4444; margin-top: 16px; font-weight: 500;">
                                ⏰ This OTP is valid for <b>5 minutes</b> only.
                            </p>

                            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />

                            <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.4;">
                                If you did not request this verification code, please ignore this email.
                            </p>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                            &copy; ${new Date().getFullYear()} AuraAvenue. All rights reserved.
                        </div>
                    </div>
                `
            };

           const info = await transporter.sendMail(userMailOptions);
            return info;
        }

    } catch (error) {
        console.error(`Send OTP Exception for (${email}):`, error.message);
        // PUT 'throw error;' BACK: This tells the frontend it actually failed!
        throw error; 
    }
}

module.exports = {
    sendOtp
};

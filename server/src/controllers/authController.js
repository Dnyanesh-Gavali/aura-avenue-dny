const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb"); // FIX 1: Added ObjectId import
const { OAuth2Client } = require("google-auth-library");
const { 
    collectionUserData, 
    collectionOtps, 
    collectionQuries,
    collectionNotifications // FIX 2: Added collectionNotifications import
} = require("../config/db");
const { sendOtp } = require("../services/otpService");
const transporter = require("../config/mail");

// Google OAuth Client Initialization
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- HELPER FUNCTIONS ---
const determineRole = (email) => {
    return /^admin(\d+)?@aura\.com$/i.test(email) ? "admin" : "user";
};

const sendAuthCookie = (res, userPayload) => {
    const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,      // MUST be true for cross-origin
        sameSite: "none",  // MUST be "none" for Vercel -> Render communication
        maxAge: 3600000 
    });
    return token;
};
const getEmailFromToken = (req) => {
    const token = req.cookies.token;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.email;
    } catch (err) {
        return null;
    }
};

/**
 * 1. Send OTP Controller
 */
const sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        await sendOtp(normalizedEmail);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });
    } catch (err) {
        console.error("Send OTP Error:", err);
        return res.status(500).json({ success: false, message: "Error sending OTP" });
    }
};

/**
 * 2. Verify OTP Controller
 */
const verifyOtp = async (req, res) => {
    try {
        const { email, otp1 } = req.body;

        if (!email || !otp1) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const latestOtp = await collectionOtps
            .find({ email: normalizedEmail })
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();

        if (latestOtp.length === 0) {
            return res.status(400).json({ success: false, message: "OTP record not found" });
        }

        const otpData = latestOtp[0];
        const fiveMinutes = 5 * 60 * 1000;

        if (Date.now() - new Date(otpData.createdAt).getTime() > fiveMinutes) {
            await collectionOtps.deleteOne({ _id: otpData._id });
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        if (otpData.otp.toString() !== otp1.toString().trim()) {
            return res.status(400).json({ success: false, message: "Invalid OTP code" });
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (err) {
        console.error("Verify OTP Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * 3. Reset Password Controller
 */
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are mandatory" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const latestOtpRecord = await collectionOtps
            .find({ email: normalizedEmail })
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();

        if (latestOtpRecord.length === 0) {
            return res.status(400).json({ success: false, message: "Verification OTP not found" });
        }

        const otpData = latestOtpRecord[0];
        const fiveMinutes = 5 * 60 * 1000;

        if (Date.now() - new Date(otpData.createdAt).getTime() > fiveMinutes) {
            await collectionOtps.deleteOne({ _id: otpData._id });
            return res.status(400).json({ success: false, message: "Verification token expired" });
        }

        if (otpData.otp.toString() !== otp.toString().trim()) {
            return res.status(400).json({ success: false, message: "Invalid validation OTP code" });
        }

        const hashedSecurePassword = await bcrypt.hash(newPassword, 10);

        const updatedResult = await collectionUserData.updateOne(
            { email: normalizedEmail },
            { $set: { password: hashedSecurePassword } }
        );

        if (updatedResult.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "User account not found" });
        }

        await collectionOtps.deleteOne({ _id: otpData._id });

        return res.status(200).json({
            success: true,
            message: "Password updated successfully!"
        });

    } catch (err) {
        console.error("Reset Password Error:", err);
        return res.status(500).json({ success: false, message: "Database failure occurred while updating password" });
    }
};

/**
 * 4. Signup Controller
 */
const signup = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;

        if (!fullName || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: "All parameters are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPhone = phone.trim();

        const existingUser = await collectionUserData.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({ 
                success: false, 
                message: "An account already exists with this email" 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await collectionUserData.insertOne({
            name: fullName.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            password: hashedPassword,
            createdAt: new Date()
        });

        const role = determineRole(normalizedEmail);
        sendAuthCookie(res, {
            email: normalizedEmail,
            name: fullName.trim(),
            role
        });

        return res.status(200).json({ success: true, message: "Account created successfully" });

    } catch (err) {
        console.error("Signup Error:", err);
        return res.status(500).json({ success: false, message: "Failed to create account" });
    }
};

/**
 * 5. Login Controller
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Credentials are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await collectionUserData.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({ success: false, message: "Account not found" });
        }

        if (!user.password) {
            return res.status(400).json({ 
                success: false, 
                message: "This account was registered using Google. Please log in with Google." 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        const role = determineRole(user.email);
        sendAuthCookie(res, {
            email: user.email,
            name: user.name || "",
            role
        });

        return res.status(200).json({ 
            success: true, 
            message: "Login successful",
            email: user.email,
            name: user.name || "",
            role
        });

    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * 6. Direct Google Login Controller (Single-Step Authentication)
 */
const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: "Google ID Token is required" });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ success: false, message: "Invalid Google Token payload" });
        }

        const normalizedEmail = payload.email.trim().toLowerCase();
        const name = payload.name || "Google User";

        let user = await collectionUserData.findOne({ email: normalizedEmail });

        if (!user) {
            const newUser = {
                name,
                email: normalizedEmail,
                googleId: payload.sub,
                isGoogleUser: true,
                createdAt: new Date()
            };
            await collectionUserData.insertOne(newUser);
            user = newUser;
        }

        const role = determineRole(user.email);
        sendAuthCookie(res, {
            email: user.email,
            name: user.name || "",
            role
        });

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            email: user.email,
            name: user.name || "",
            role
        });

    } catch (err) {
        console.error("Google Login Error:", err);
        return res.status(401).json({ success: false, message: "Google authentication failed or expired token" });
    }
};

/**
 * 7. Verify Google Token (Step 1 for Multi-Step Google Setup)
 */
const verifyGoogleToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const normalizedEmail = payload.email.trim().toLowerCase();
        const existingUser = await collectionUserData.findOne({ email: normalizedEmail });

        if (existingUser) {
            const role = determineRole(existingUser.email);
            sendAuthCookie(res, {
                email: existingUser.email,
                name: existingUser.name || "",
                role
            });

            return res.status(200).json({
                success: true,
                isExistingUser: true,
                message: "Logged in successfully",
                email: existingUser.email,
                name: existingUser.name || "",
                role
            });
        }

        return res.status(200).json({
            success: true,
            isExistingUser: false,
            name: payload.name,
            email: normalizedEmail,
            googleId: payload.sub
        });

    } catch (error) {
        console.error("Verify Google Token Error:", error);
        return res.status(400).json({ success: false, message: "Invalid Google Token" });
    }
};

/**
 * 8. Google Registration Completion (Step 2 for Multi-Step Google Setup)
 */
const googleSignup = async (req, res) => {
    try {
        const { token, password, fullName } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: "Google token is required for completion" });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const normalizedEmail = payload.email.trim().toLowerCase();

        const existingUser = await collectionUserData.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists with this email" });
        }

        const userObj = {
            name: (fullName || payload.name).trim(),
            email: normalizedEmail,
            googleId: payload.sub,
            isGoogleUser: true,
            createdAt: new Date()
        };

        if (password) {
            userObj.password = await bcrypt.hash(password, 10);
        }

        await collectionUserData.insertOne(userObj);

        const role = determineRole(normalizedEmail);
        sendAuthCookie(res, {
            email: normalizedEmail,
            name: userObj.name,
            role
        });

        return res.status(201).json({
            success: true,
            message: "Account completed successfully"
        });

    } catch (error) {
        console.error("Google Signup Error:", error);
        return res.status(500).json({ success: false, message: "Server error during registration" });
    }
};

/**
 * 9. Contact Us Controller
 */
const contactUs = async (req, res) => {
    try {
        const { topic, emailOrPhone, message } = req.body;

        if (!topic || !emailOrPhone || !message) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const cleanContact = emailOrPhone.trim();

        const newQuery = {
            topic,
            contact: cleanContact,      
            emailOrPhone: cleanContact, 
            message: message.trim(),
            status: "pending",          
            createdAt: new Date()
        };

        const result = await collectionQuries.insertOne(newQuery);
        const receiptNo = result.insertedId.toString();

        if (cleanContact.includes("@")) {
            try {
                await transporter.sendMail({
                    from: `"AuraAvenue Support" <${process.env.EMAIL_USER}>`,
                    to: cleanContact,
                    subject: `Query Received - Receipt #${receiptNo.slice(-6).toUpperCase()}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; color: #1e293b;">
                            <div style="background-color: #14c38e; padding: 20px; text-align: center; color: #ffffff;">
                                <h2 style="margin: 0; font-size: 22px; font-weight: bold;">Query Receipt</h2>
                                <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">AuraAvenue Customer Support</p>
                            </div>

                            <div style="padding: 24px;">
                                <p style="margin-top: 0; font-size: 15px; color: #475569;">Dear Valued Customer,</p>
                                <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                                    Thank you for contacting us. Your query has been successfully registered in our system.
                                </p>
                            </div>
                        </div>
                    `
                });
            } catch (mailErr) {
                console.error("Confirmation Mail Error:", mailErr.message);
            }
        }

        return res.status(200).json({
            success: true,
            receiptNo: receiptNo,
            message: "Query submitted successfully"
        });

    } catch (err) {
        console.error("Contact US Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * 10. Token Verification Handler
 */
const verifyToken = async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, message: "Token not found. Please log in again." });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: "Invalid or expired token. Please log in again." });
        }

        try {
            let name = decoded.name;
            if (!name) {
                const user = await collectionUserData.findOne({ email: decoded.email });
                name = user ? user.name : "";
            }

            return res.status(200).json({
                success: true,
                message: "Token is valid",
                email: decoded.email,
                name: name,
                role: decoded.role
            });
        } catch (dbErr) {
            console.error("VerifyToken DB Error:", dbErr);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    });
};

/**
 * 11. Logout Controller
 */
const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,      // MUST match the creation settings
        sameSite: "none"   // MUST match the creation settings
    });
    return res.status(200).json({ success: true, message: "Logout successful" });
};
/**
 * 12. Update Profile Controller
 */
const updateProfile = async (req, res) => {
    try {
        const email = getEmailFromToken(req) || req.body.email;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required to update profile" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const { name, phone, country, city, postalCode } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone.trim();
        if (country !== undefined) updateData.country = country.trim();
        if (city !== undefined) updateData.city = city.trim();
        if (postalCode !== undefined) updateData.postalCode = postalCode.trim();

        const result = await collectionUserData.updateOne(
            { email: normalizedEmail },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully!"
        });

    } catch (err) {
        console.error("Update Profile Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error while updating profile"
        });
    }
};

/**
 * 13. Change Password Controller
 */
const changePassword = async (req, res) => {
    try {
        const email = getEmailFromToken(req) || req.body.email;
        const { currentPassword, newPassword } = req.body;

        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "All password fields are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await collectionUserData.findOne({ email: normalizedEmail });
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User account not found" });
        }

        if (!user.password) {
            return res.status(400).json({ success: false, message: "Google signed-in users cannot change password directly" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await collectionUserData.updateOne(
            { email: normalizedEmail },
            { $set: { password: hashedNewPassword } }
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully!"
        });

    } catch (err) {
        console.error("Change Password Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error while changing password"
        });
    }
};

// --- CONTROLLER: Toggle Favorite Package ---
const toggleFavorite = async (req, res) => {
    try {
        const email = getEmailFromToken(req);
        if (!email) return res.status(401).json({ success: false, message: "Please log in to save favorites" });

        const { packageData } = req.body;
        const user = await collectionUserData.findOne({ email });

        const favorites = user.favorites || [];
        const exists = favorites.some(fav => 
            (packageData._id && fav._id === packageData._id) || 
            (packageData.id && fav.id === packageData.id)
        );

        if (exists) {
            await collectionUserData.updateOne(
                { email },
                { $pull: { favorites: { $or: [{ id: packageData.id }, { _id: packageData._id }] } } }
            );
            return res.status(200).json({ success: true, isLiked: false, message: "Removed from favorites" });
        } else {
            await collectionUserData.updateOne(
                { email },
                { $push: { favorites: packageData } }
            );
            return res.status(200).json({ success: true, isLiked: true, message: "Added to favorites" });
        }
    } catch (err) {
        console.error("Toggle Favorite Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// --- CONTROLLER: Save Itinerary ---
const saveItinerary = async (req, res) => {
    try {
        const email = getEmailFromToken(req);
        if (!email) return res.status(401).json({ success: false, message: "Please log in to save itinerary" });

        const { itinerary } = req.body;
        await collectionUserData.updateOne(
            { email },
            { $push: { itineraries: itinerary } }
        );
        return res.status(200).json({ success: true, message: "Itinerary saved successfully!" });
    } catch (err) {
        console.error("Save Itinerary Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// --- CONTROLLER: Delete Itinerary ---
const deleteItinerary = async (req, res) => {
    try {
        const email = getEmailFromToken(req);
        if (!email) return res.status(401).json({ success: false, message: "Unauthorized" });

        const { id } = req.params;
        await collectionUserData.updateOne(
            { email },
            { $pull: { itineraries: { id: parseInt(id) } } }
        );
        return res.status(200).json({ success: true, message: "Itinerary deleted" });
    } catch (err) {
        console.error("Delete Itinerary Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// --- CONTROLLER: Get User Profile Data ---
const getUserData = async (req, res) => {
    try {
        const email = req.body.email || getEmailFromToken(req);
        
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const userData = await collectionUserData.findOne(
            { email: normalizedEmail },
            { projection: { password: 0 } }
        );

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            user: userData
        });
    } catch (err) {
        console.error("Get User Data Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching user data"
        });
    }
};




module.exports = {
    login,
    signup,
    sendOtpController,
    googleLogin,
    verifyOtp,
    resetPassword,
    contactUs,
    verifyToken,
    logout,
    getUserData,
    updateProfile,
    changePassword,
    toggleFavorite,
    saveItinerary,
    deleteItinerary,
    verifyGoogleToken,
    googleSignup
};

const express = require("express");

/**
 * @module authRoutes
 * @requires express
 * @requires ../controllers/authController
 * @returns {Object} router - Express Router object with defined authentication routes
 */

const router = express.Router();

const {
    login,
    signup,
    googleLogin,
    sendOtpController,
    verifyOtp,
    resetPassword,
    contactUs,
    verifyToken,
    logout,
    getUserData,
    changePassword,
    updateProfile,
    toggleFavorite,
    saveItinerary,
    deleteItinerary,
    verifyGoogleToken, // New Controller
    googleSignup,        // New Controller
    getNotifications, // New Controller
    clearNotifications, // New Controller
} = require("../controllers/authController");

router.post("/login", login);

router.post("/google", googleLogin); 

// Google Multi-step Signup Routes
router.post("/verify-google-token", verifyGoogleToken);
router.post("/googleSignup", googleSignup);

router.post("/logout", logout);

router.post("/signup", signup);

router.post("/send-otp", sendOtpController);

router.post("/verify-otp", verifyOtp);

router.post("/reset-password", resetPassword);

router.post("/contact-us", contactUs);

router.post("/verify-token", verifyToken);

router.post("/get-user-data", getUserData);

router.post("/change-password", changePassword);

router.post("/update-profile", updateProfile);

router.post("/toggle-favorite", toggleFavorite);

router.post("/save-itinerary", saveItinerary);

router.delete("/delete-itinerary/:id", deleteItinerary);



module.exports = router;
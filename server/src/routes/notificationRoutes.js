const express = require("express");
const router = express.Router();

const {
  getAllNotifications,
  markAsRead,
  getAllUnreadNotifications,
  createNotification // 👈 Imported
} = require("../controllers/notificationController");

/**
 * @route   POST /notifications/get-all
 */
router.post("/get-all", getAllNotifications);

/**
 * @route   POST /notifications/mark-read
 */
router.post("/mark-read", markAsRead);

/**
 * @route   POST /notifications/unread
 */
router.post("/unread", getAllUnreadNotifications);

/**
 * @route   POST /notifications/create
 * @desc    Create and send a notification to every user
 */
router.post("/create", createNotification); // 👈 New Endpoint

module.exports = router;
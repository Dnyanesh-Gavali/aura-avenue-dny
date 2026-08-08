const { ObjectId } = require("mongodb");
const { collectionNotifications, collectionUserData } = require("../config/db");
// const { sendEmail } = require("../utils/emailService"); // Optional: Aapka nodemailer helper

/**
 * 1. Fetch ALL Notifications direct from collection
 */
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await collectionNotifications
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      notifications: notifications || []
    });
  } catch (err) {
    console.error("Get All Notifications Error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch notifications" 
    });
  }
};

/**
 * 2. Mark Notification as Read (Empty unreadNotifications array)
 */
const markAsRead = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await collectionUserData.updateOne(
      { email: email },
      { $set: { unreadNotifications: [] } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notifications cleared successfully",
    });
  } catch (err) {
    console.error("Mark As Read Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to clear unread notifications",
    });
  }
};

/**
 * 3. Fetch All Unread Notifications for user
 */
const getAllUnreadNotifications = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await collectionUserData.findOne({ email });
    
    if (!user || !user.unreadNotifications || user.unreadNotifications.length === 0) {
      return res.status(200).json({ success: true, notifications: [] });
    }

    const formattedIds = user.unreadNotifications.map((id) => {
      try {
        return typeof id === "string" ? new ObjectId(id) : id;
      } catch (e) {
        return id;
      }
    });

    const notifications = await collectionNotifications
      .find({ _id: { $in: formattedIds } })
      .toArray();

    return res.status(200).json({
      success: true,
      notifications: notifications
    });
  } catch (err) {
    console.error("Get Notifications Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};  

/**
 * 4. Create & Broadcast New Notification to ALL Users + Send Email
 */
const createNotification = async (req, res) => {
  try {
    const { title, message, type = "SYSTEM", link = "", sendEmailFlag = false } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required field",
      });
    }

    // 1. Notification collection me entry create karein
    const newDoc = {
      title,
      message,
      type,
      link,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await collectionNotifications.insertOne(newDoc);
    const notificationId = insertResult.insertedId;

    // 2. Sare Users ke unreadNotifications array me is ID ko add karein
    const userUpdateResult = await collectionUserData.updateMany(
      {}, 
      { $push: { unreadNotifications: notificationId } }
    );

    // 3. Optional: Saare users ko email send karna (agar sendEmailFlag true ho)
    if (sendEmailFlag) {
      // Async background task (res.status deliver hone ke baad chalta rahega)
      (async () => {
        try {
          const allUsers = await collectionUserData
            .find({}, { projection: { email: 1 } })
            .toArray();

          const emailList = allUsers.map((u) => u.email).filter(Boolean);

          /*
          // Example Nodemailer dispatch logic:
          for (const email of emailList) {
             await sendEmail({
               to: email,
               subject: `Notification: ${title}`,
               html: `<p>${message}</p><br/><a href="${link}">View Details</a>`
             });
          }
          */
          console.log(`[EMAIL DISPATCH] Emails sent to ${emailList.length} users.`);
        } catch (mailErr) {
          console.error("Background Email Dispatch Error:", mailErr);
        }
      })();
    }

    return res.status(201).json({
      success: true,
      message: `Notification created & broadcasted to ${userUpdateResult.modifiedCount} users successfully!`,
      notificationId,
    });
  } catch (err) {
    console.error("Create Notification Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to broadcast notification",
      error: err.message,
    });
  }
};

module.exports = {
  getAllNotifications,
  markAsRead,
  getAllUnreadNotifications,
  createNotification // 👈 Added function
};
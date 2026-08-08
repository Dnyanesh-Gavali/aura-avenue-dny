const { ObjectId } = require("mongodb");
const transporter = require("../config/mail");
const { 
  collectionQuries, 
  collectionOtps, 
  collectionPackages 
} = require("../config/db");

// ==========================================
// 1. QUERY & SUPPORT CONTROLLERS
// ==========================================

// Fetch Pending Queries
const pendingQueries = async (req, res) => {
  try {
    const queries = await collectionQuries
      .find({ status: "pending" })
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json({ success: true, queries });
  } catch (err) {
    console.error("Pending Queries Error:", err);
    res.status(500).json({ success: false, message: "Error fetching queries" });
  }
};

// Fetch Resolved Queries
const resolvedQueries = async (req, res) => {
  try {
    const queries = await collectionQuries
      .find({ status: "resolved" })
      .sort({ resolvedAt: -1 })
      .toArray();
    res.status(200).json({ success: true, queries });
  } catch (err) {
    console.error("Resolved Queries Error:", err);
    res.status(500).json({ success: false, message: "Error fetching resolved queries" });
  }
};

// Update Query Status & Send Email Notification
const updateQueryStatus = async (req, res) => {
  try {
    const { id, message, resolvedBy } = req.body;

    if (!id || !message) {
      return res.status(400).json({
        success: false,
        message: "Query ID and message are required",
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Query ID",
      });
    }

    // Check Query Existence
    const query = await collectionQuries.findOne({ _id: new ObjectId(id) });

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    // Update Query in Database
    await collectionQuries.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "resolved",
          resolvedBy: resolvedBy || "Admin",
          replyMessage: message,
          resolvedAt: new Date(),
        },
      }
    );

    // Send Resolution Email
    try {
      console.log(`Sending query resolution email to: ${query.contact}...`);

      const mailOptions = {
        from: `"AuraAvenue Support" <${process.env.EMAIL_USER}>`,
        to: query.contact,
        subject: `Query Resolved - [${query.topic}]`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; color: #1e293b;">
              
              <!-- Header -->
              <div style="background-color: #10b981; padding: 24px; text-align: center; color: #ffffff;">
                  <h2 style="margin: 0; font-size: 20px; font-weight: 600;">Query Resolved</h2>
                  <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">AuraAvenue Support Team</p>
              </div>

              <!-- Content Body -->
              <div style="padding: 24px;">
                  <p style="margin-top: 0; font-size: 15px; color: #334155;">Hello,</p>
                  <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                      Great news! Your query regarding <b style="color: #0f172a;">${query.topic}</b> has been reviewed and resolved by our support team.
                  </p>

                  <!-- Details Card -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                      
                      <!-- Customer Message -->
                      <div style="margin-bottom: 16px;">
                          <span style="font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                              Your Message / Query:
                          </span>
                          <div style="font-size: 13px; color: #475569; background-color: #f1f5f9; padding: 10px 12px; border-radius: 6px; border-left: 4px solid #94a3b8; font-style: italic; line-height: 1.4;">
                              "${query.message || "No message content provided."}"
                          </div>
                      </div>

                      <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 16px 0;" />
                      
                      <!-- Admin Reply -->
                      <div>
                          <span style="font-size: 12px; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                              Admin Reply / Resolution:
                          </span>
                          <div style="font-size: 14px; color: #0f172a; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #cbd5e1; line-height: 1.5; white-space: pre-line; font-weight: 500;">
                              ${message}
                          </div>
                      </div>

                  </div>

                  <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                      If you still have any questions or require further assistance, please feel free to reach out to us again.
                  </p>

                  <br />
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">Best regards,</p>
                  <p style="margin: 2px 0 0; font-size: 14px; font-weight: bold; color: #10b981;">AuraAvenue Support Team</p>
              </div>

              <!-- Footer -->
              <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8;">
                  This is an automated response regarding your support request.
              </div>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Resolution email sent successfully! Message ID:", info.messageId);
    } catch (mailError) {
      console.error("❌ Resolution Email Error:", mailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Query resolved successfully",
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

// Get Admin OTP Logs
const getAdminOtpLogs = async (req, res) => {
  try {
    const otpLogs = await collectionOtps
      .find({ email: { $regex: /^admin(\d+)?@aura\.com$/i } })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      otpLogs,
    });
  } catch (err) {
    console.error("Fetch OTP Logs Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin OTP logs",
    });
  }
};

// ==========================================
// 2. TRAVEL PACKAGE CONTROLLERS
// ==========================================

// Get All Packages
const getAllPackages = async (req, res) => {
  try {
    const packages = await collectionPackages.find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ success: true, packages });
  } catch (err) {
    console.error("Fetch Packages Error:", err);
    return res.status(500).json({ success: false, message: "Error fetching packages" });
  }
};

// Add New Package
const addPackage = async (req, res) => {
  try {
    const {
      title, badge, category, continent, country, duration,
      location, price, originalPrice, rating, type, image, about,
      features, itinerary
    } = req.body;

    if (!title || !location || !price || !image) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    // Helper for safe Array conversion
    const formatArray = (input) => {
      if (Array.isArray(input)) return input;
      if (typeof input === "string") return input.split("\n").map(i => i.trim()).filter(Boolean);
      return [];
    };

    const newPackage = {
      title: title.trim(),
      badge: badge ? badge.trim() : "",
      category: category ? category.trim() : "International",
      continent: continent ? continent.trim() : "",
      country: country ? country.trim() : "",
      duration: duration ? duration.trim() : "",
      location: location.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      rating: rating ? Number(rating) : 4.5,
      type: type ? type.trim() : "",
      image: image.trim(),
      about: about ? about.trim() : "",
      features: formatArray(features),
      itinerary: formatArray(itinerary),
      createdAt: new Date(),
    };

    await collectionPackages.insertOne(newPackage);

    return res.status(201).json({ success: true, message: "Package added successfully!" });
  } catch (err) {
    console.error("Add Package Error:", err);
    return res.status(500).json({ success: false, message: "Server error while adding package" });
  }
};

// Update Existing Package
const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, badge, category, continent, country, duration,
      location, price, originalPrice, rating, type, image, about,
      features, itinerary
    } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Package ID" });
    }

    const formatArray = (input) => {
      if (Array.isArray(input)) return input;
      if (typeof input === "string") return input.split("\n").map(i => i.trim()).filter(Boolean);
      return [];
    };

    const updatedData = {
      title: title?.trim(),
      badge: badge ? badge.trim() : "",
      category: category ? category.trim() : "International",
      continent: continent ? continent.trim() : "",
      country: country ? country.trim() : "",
      duration: duration ? duration.trim() : "",
      location: location?.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      rating: rating ? Number(rating) : 4.5,
      type: type ? type.trim() : "",
      image: image?.trim(),
      about: about ? about.trim() : "",
      features: formatArray(features),
      itinerary: formatArray(itinerary),
      updatedAt: new Date(),
    };

    const result = await collectionPackages.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    return res.status(200).json({ success: true, message: "Package updated successfully!" });
  } catch (err) {
    console.error("Update Package Error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating package" });
  }
};

// Delete Package
const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Package ID" });
    }

    const result = await collectionPackages.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    return res.status(200).json({ success: true, message: "Package deleted successfully!" });
  } catch (err) {
    console.error("Delete Package Error:", err);
    return res.status(500).json({ success: false, message: "Server error while deleting package" });
  }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  pendingQueries,
  updateQueryStatus,
  resolvedQueries,
  getAdminOtpLogs,
  getAllPackages,
  addPackage,
  updatePackage,
  deletePackage,
};
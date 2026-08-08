const express = require("express");

/**
 * @module adminRoutes
 * @requires express
 * @requires ../controllers/adminController
 * @returns {Object} router - Express Router object with defined admin routes
 */

const router = express.Router();

const { 
  pendingQueries, 
  updateQueryStatus, 
  resolvedQueries, 
  getAdminOtpLogs, 
  addPackage, 
  getAllPackages, 
  updatePackage, 
  deletePackage 
} = require("../controllers/adminController");

// Query & Log Routes
router.get("/pending-queries", pendingQueries);
router.patch("/resolve-query", updateQueryStatus);
router.get("/resolved-queries", resolvedQueries);
router.get("/admin-otp", getAdminOtpLogs);

// Travel Package Routes
router.post("/add-package", addPackage);
router.get("/get-all-packages", getAllPackages); // Changed from POST to GET
router.patch("/update-package/:id", updatePackage); // Changed :packageId to :id
router.delete("/delete-package/:id", deletePackage); // Changed :packageId to :id

module.exports = router;
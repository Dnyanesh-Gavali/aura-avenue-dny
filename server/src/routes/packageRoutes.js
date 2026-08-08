const express = require("express");
const router = express.Router();
const { getAllPackages, getPackageAttractions,addPackageReview } = require("../controllers/packageController");

// GET /api/packages
router.get("/", getAllPackages);

// GET /api/packages/:id/attractions
router.get("/:id/attractions", getPackageAttractions);

router.post("/:id/reviews", addPackageReview);
module.exports = router;
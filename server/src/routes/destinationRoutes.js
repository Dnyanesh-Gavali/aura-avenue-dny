const express = require('express');
const router = express.Router();

// 1. Single unified import for all controller functions
const { 
    getDestinationInfo, 
    getAutocompleteSuggestions, 
    getDestinationWeather, 
    getDestinationCardInfo,
    getPaginatedDestinations,
    getDestinationAttractions,
    getRecommendedDestinations,
    getSimilarDestinations
} = require('../controllers/destinationController');


// Route to get destination tourist attractions
router.get("/attractions", getDestinationAttractions);

// Route to get destination overview details
router.get("/info", getDestinationInfo);

// Route to handle live search text autocomplete dropdowns
router.get("/autocomplete", getAutocompleteSuggestions);

// Route to get destination live weather
router.get("/weather", getDestinationWeather);

// For cards only! Prevents Unsplash rate limits.
router.get("/card-info", getDestinationCardInfo);

// Route to get paginated destinations (10,000+ optimized)
router.get("/all", getPaginatedDestinations);

// Route to get personalized recommendations based on view history
router.post("/recommended", getRecommendedDestinations);

router.get("/similar", getSimilarDestinations);

module.exports = router;
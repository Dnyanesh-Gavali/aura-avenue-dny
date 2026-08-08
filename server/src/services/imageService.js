const axios = require('axios');

/**
 * Fetches a high-quality landscape image from Unsplash for a given location.
 * @param {string} locationName - The name of the city or destination.
 * @returns {string|null} The image URL or null if not found.
 */

async function fetchImageFromUnsplash(locationName) {
    try {
        const accessKey = process.env.UNSPLASH_ACCESS_KEY;
        if (!accessKey) {
            console.warn("Unsplash API key is missing from .env");
            return null;
        }

        // Add modifiers to force Unsplash to find scenic/tourism photos
        const searchQuery = `${locationName} travel landmark nature`;

        // Pass the new searchQuery into the URL instead of just locationName
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=1&client_id=${accessKey}`;
        const response = await axios.get(url);

        if (response.data.results && response.data.results.length > 0) {
            // Using 'raw' allows us to define exact optimized dimensions for the Hero section
            const rawUrl = response.data.results[0].urls.raw;
            // Force 1920x1080 landscape, 80% quality, webp format for zero lag
            return `${rawUrl}&w=1920&h=1080&fit=crop&q=80&auto=format`; 
        }
        
        return null;
    } catch (error) {
        console.error("Unsplash API error:", error.message);
        return null;
    }
}

module.exports = {
    fetchImageFromUnsplash
};
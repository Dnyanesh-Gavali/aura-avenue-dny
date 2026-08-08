const axios = require('axios');

/**
 * Fetches a high-quality landscape travel image from Pexels.
 * @param {string} locationName - The package location or title.
 * @returns {string|null} Image URL or null if failed.
 */
async function fetchImageFromPexels(locationName) {
    try {
        const apiKey = process.env.PEXELS_API_KEY;
        if (!apiKey) {
            console.warn("Pexels API key missing from .env");
            return null;
        }

        // Add travel modifiers to enforce scenic tourism pictures
        const searchQuery = `${locationName} travel landmark scenery`;
        
        // FIX: Ask for 15 images instead of 1 so we have variety!
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=15`;

        const response = await axios.get(url, {
            headers: {
                Authorization: apiKey
            }
        });

        const photos = response.data.photos;

        if (photos && photos.length > 0) {
            // FIX: Pick a random image from the 15 returned results
            const randomIndex = Math.floor(Math.random() * photos.length);
            
            // Return the randomly selected image
            return photos[randomIndex].src.landscape || photos[randomIndex].src.large2x;
        }

        return null;
    } catch (error) {
        console.error("Pexels API error:", error.message);
        return null;
    }
}

module.exports = {
    fetchImageFromPexels
};
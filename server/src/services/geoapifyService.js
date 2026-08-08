const axios = require('axios');

/**
 * Fetches top tourist attractions for a given location using Geoapify.
 * @param {string} locationName - The package location (e.g., "Bali, Indonesia")
 */
async function fetchAttractionsFromGeoapify(locationName) {
    try {
        const apiKey = process.env.GEOAPIFY_API_KEY;
        if (!apiKey) {
            console.warn("Geoapify API key missing from .env");
            return null;
        }

        // 1. Geocode the location name to get Latitude and Longitude
        const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(locationName)}&limit=1&apiKey=${apiKey}`;
        const geoRes = await axios.get(geoUrl);
        
        if (!geoRes.data.features || geoRes.data.features.length === 0) {
            return [];
        }
        
        const { lon, lat } = geoRes.data.features[0].properties;

        // 2. Fetch tourist attractions within a 10km radius (10000 meters)
        const placesUrl = `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:${lon},${lat},10000&limit=15&apiKey=${apiKey}`;
        const placesRes = await axios.get(placesUrl);
        
        if (!placesRes.data.features) return [];

        // 3. Format and clean the results
        return placesRes.data.features
            .map(f => ({
                name: f.properties.name || "Unknown Attraction",
                formattedAddress: f.properties.formatted,
                lat: f.properties.lat,
                lon: f.properties.lon
            }))
            .filter(a => a.name !== "Unknown Attraction");

    } catch (error) {
        console.error("Geoapify API error:", error.message);
        return [];
    }
}

module.exports = { fetchAttractionsFromGeoapify };
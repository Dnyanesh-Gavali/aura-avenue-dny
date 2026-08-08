const axios = require("axios");
/**
 * Fetches current weather & 5-day forecast for a given location name.
 * Uses Open-Meteo (100% Free, No API Key needed).
 */
async function fetchWeather(locationName) {
    try {
        // 1. Geocode: Request up to 5 results to avoid getting a bigger city with a similar name
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName.trim())}&count=5&language=en&format=json`;
        const geoRes = await axios.get(geoUrl);

        if (!geoRes.data.results || geoRes.data.results.length === 0) {
            return null;
        }

        // 2. Find exact match (e.g., "Leh" instead of "Le Havre"). Fallback to first result if no exact match.
        const exactMatch = geoRes.data.results.find(
            (loc) => loc.name.toLowerCase() === locationName.trim().toLowerCase()
        );
        const location = exactMatch || geoRes.data.results[0];

        const { latitude, longitude, name, country } = location;

        // 3. Fetch live weather & daily forecast metrics
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
        const weatherRes = await axios.get(weatherUrl);

        const current = weatherRes.data.current;
        const daily = weatherRes.data.daily;

        return {
            locationName: name,
            country: country || "",
            latitude,
            longitude,
            current: {
                temp: Math.round(current.temperature_2m ?? 0),
                feelsLike: Math.round(current.apparent_temperature ?? 0),
                humidity: current.relative_humidity_2m ?? 0,
                windSpeed: Math.round(current.wind_speed_10m ?? 0),
                weatherCode: current.weather_code ?? 0,
                isDay: current.is_day === 1
            },
            forecast: daily.time.map((date, index) => ({
                date,
                maxTemp: Math.round(daily.temperature_2m_max?.[index] ?? 0),
                minTemp: Math.round(daily.temperature_2m_min?.[index] ?? 0),
                feelsLike: Math.round(daily.apparent_temperature_max?.[index] ?? 0),
                rainChance: Math.round(daily.precipitation_probability_max?.[index] ?? 0), 
                windSpeed: Math.round(daily.wind_speed_10m_max?.[index] ?? 0),
                weatherCode: daily.weather_code?.[index] ?? 0
            }))
        };
    } catch (error) {
        console.error("Error fetching weather from Open-Meteo:", error.message);
        throw error;
    }
}

module.exports = {
    fetchWeather
};
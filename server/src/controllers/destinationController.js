
const { db, collectionDestinations } = require('../config/db');
const { fetchWeather } = require('../services/weatherService');
const { fetchLocation } = require('../services/wikiService')
const { fetchImageFromUnsplash } = require('../services/imageService')
const { fetchAttractionsFromGeoapify } = require('../services/geoapifyService');

// Add this below your getDestinationInfo function
const getDestinationCardInfo = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ success: false, message: "Location 'name' is required." });
        }

        const cleanName = name.trim();

        // 1. Look for URL first from MongoDB Cache (Case-insensitive)
        const destinationRecord = await collectionDestinations.findOne({
            city: { $regex: `^${cleanName}$`, $options: "i" }
        });

        if (destinationRecord) {
            // WORKFLOW MATCH: If Unsplash image exists (Hero was visited), return it!
            if (destinationRecord.imageUrl) {
                return res.status(200).json({ success: true, image: destinationRecord.imageUrl, source: 'unsplash' });
            }
            // If we previously cached a Wikipedia image, return that to save API calls
            if (destinationRecord.wikiThumbnail) {
                return res.status(200).json({ success: true, image: destinationRecord.wikiThumbnail, source: 'wikipedia-cache' });
            }
        }

        // 2. If nothing in DB, take from Wikipedia
        const wikiData = await fetchLocation(cleanName);
        const wikiImage = wikiData && wikiData.thumbnail 
            ? wikiData.thumbnail 
            : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"; // Generic fallback

        // 3. Save Wikipedia thumbnail to MongoDB so we don't fetch it again
        await collectionDestinations.updateOne(
            { city: { $regex: `^${cleanName}$`, $options: "i" } },
            {
                $set: { city: cleanName, wikiThumbnail: wikiImage },
                $setOnInsert: { country: wikiData ? wikiData.description : "Unknown" }
            },
            { upsert: true }
        );

        return res.status(200).json({ success: true, image: wikiImage, source: 'wikipedia-api' });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};


const getDestinationInfo = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Location 'name' query parameter is required."
            });
        }

        // Fetch Wiki data
        const wikiData = await fetchLocation(name);
        if (!wikiData) {
            return res.status(404).json({
                success: false,
                message: `Could not find any Wikipedia information for '${name}'.`
            });
        }

        // Check Database for an existing image (Case-insensitive search)
        let destinationRecord = await collectionDestinations.findOne({
            city: { $regex: `^${name.trim()}$`, $options: "i" }
        });

        let heroImageUrl = null;

        if (destinationRecord && destinationRecord.imageUrl) {
            // CACHE HIT: Image exists in our database
            heroImageUrl = destinationRecord.imageUrl;
            console.log(`Served image for ${name} from MongoDB Cache`);
        }

        else {
            // CACHE MISS: No image in DB, fetch from Unsplash
            heroImageUrl = await fetchImageFromUnsplash(name);

            if (heroImageUrl) {
                console.log(`Fetched new image for ${name} from Unsplash`);
            } else {
                console.log(`Failed to fetch Unsplash image for ${name}. (Check API limits in terminal)`);
            }

            // FIX: ALWAYS save to MongoDB! Even if Unsplash fails, we want the city recorded.
            await collectionDestinations.updateOne(
                { city: { $regex: `^${name.trim()}$`, $options: "i" } },
                {
                    $set: {
                        city: name.trim(),
                        // Only add imageUrl to the database if we actually got one
                        ...(heroImageUrl && { imageUrl: heroImageUrl })
                    },
                    $setOnInsert: { country: wikiData.description || "Unknown" }
                },
                { upsert: true }
            );
        }

        // Attach the high-quality image to the response (fallback to Wiki thumbnail if Unsplash fails)
        wikiData.heroImage = heroImageUrl || wikiData.thumbnail;

        return res.status(200).json({
            success: true,
            data: {
                ...wikiData,
                caption: wikiData.travelCaption // Pass tourism caption
            }
        });

    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve location details.",
            error: error.message
        });
    }
};

//Autocomplete Destination Suggestions
const getAutocompleteSuggestions = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim() === "") {
            return res.status(200).json([]);
        }

        // Search the "city" field using a case-insensitive prefix regex matching your CSV structures
        const suggestions = await db.collection("Destinations")
            .find({ city: { $regex: `^${q.trim()}`, $options: "i" } })
            .project({ city: 1, country: 1, _id: 0 })
            .limit(6) // Limit results to prevent UI crowding
            .toArray();

        // Standardize output keys to match the frontend expected format
        const formattedSuggestions = suggestions.map(place => ({
            name: place.city,
            country: place.country
        }));

        return res.status(200).json(formattedSuggestions);
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Autocomplete failed.",
            error: error.message
        });
    }
};

const getDestinationWeather = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Location 'name' query parameter is required."
            });
        }

        const weatherData = await fetchWeather(name);

        if (!weatherData) {
            return res.status(404).json({
                success: false,
                message: `Weather data not found for location '${name}'.`
            });
        }

        return res.status(200).json({
            success: true,
            data: weatherData
        });
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch weather data.",
            error: error.message
        });
    }
}
// Helper function to remove accents/diacritics (e.g., "Nāsik" -> "Nasik")
const removeDiacritics = (str) => {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Server-Side Paginated API for ~1,000 Famous Destinations
const getPaginatedDestinations = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 8);
        const region = req.query.continent || "India";
        
        const MAX_ITEMS_PER_TAB = 160; 
        let balancedPool = [];

        // 1. INDIA TAB LOGIC 
        if (region.toLowerCase() === "india") {
            balancedPool = await collectionDestinations
                .find({ country: { $regex: /^India$/i } })
                .project({ city: 1, country: 1, imageUrl: 1, wikiThumbnail: 1, rating: 1, description: 1 })
                // Lock original insertion order to prevent shuffling when images are saved
                .sort({ _id: 1 }) 
                .limit(MAX_ITEMS_PER_TAB)
                .toArray();
        } 
        
        // 2. CONTINENTS TAB LOGIC (Mixed Countries, max 20 per country)
        else {
            let filter = {};
            const regionMap = {
                "Asia": ["Japan", "China", "Thailand", "Vietnam", "Malaysia", "Singapore", "Indonesia", "Maldives", "United Arab Emirates", "Sri Lanka", "South Korea", "Turkey", "Philippines"],
                "Europe": ["France", "Switzerland", "Italy", "United Kingdom", "Spain", "Greece", "Germany", "Netherlands", "Austria", "Portugal", "Sweden", "Norway"],
                "North America": ["United States", "Canada", "Mexico", "Cuba", "Costa Rica", "Jamaica"],
                "South America": ["Brazil", "Argentina", "Peru", "Colombia", "Chile", "Ecuador"],
                "Africa": ["South Africa", "Egypt", "Morocco", "Kenya", "Tanzania", "Mauritius"],
                "Oceania": ["Australia", "New Zealand", "Fiji"]
            };

            if (regionMap[region]) {
                filter.country = { $in: regionMap[region].map(c => new RegExp(`^${c}$`, 'i')) };
            } else {
                filter.continent = { $regex: `^${region.trim()}$`, $options: "i" };
            }

            const pipeline = [
                { $match: filter },
                // Step A: Lock order BEFORE grouping so we always pick the exact same 20 cities per country
                { $sort: { _id: 1 } }, 
                { $group: { _id: "$country", cities: { $push: "$$ROOT" } } },
                { $project: { cities: { $slice: ["$cities", 20] } } },
                { $unwind: "$cities" },
                { $replaceRoot: { newRoot: "$cities" } },
                // Step B: CRITICAL FIX. The $group stage scrambles document order entirely. 
                // We MUST sort by _id again to undo the scramble and lock the grid layout permanently.
                // (No alphabetical sort is used here).
                { $sort: { _id: 1 } },
                { $limit: MAX_ITEMS_PER_TAB }
            ];

            balancedPool = await collectionDestinations.aggregate(pipeline).toArray();
        }

        // 3. APPLY PAGINATION IN MEMORY
        const totalItems = balancedPool.length;
        const totalPages = Math.ceil(totalItems / limit);

        if (page > totalPages && totalPages > 0) {
            return res.status(200).json({ success: true, data: [], pagination: { currentPage: page, totalPages, totalItems, itemsPerPage: limit } });
        }

        const skip = (page - 1) * limit;
        const paginatedItems = balancedPool.slice(skip, skip + limit);

        // 4. FORMAT FOR FRONTEND
        const formattedItems = paginatedItems.map((item) => {
            const cleanCityName = removeDiacritics(item.city);
            
            return {
                id: item._id,
                name: cleanCityName,
                slug: cleanCityName.toLowerCase().replace(/\s+/g, '-'),
                country: item.country || "Global",
                rating: item.rating || "4.8",
                description: item.description || `Explore scenic spots, cultural heritage, and local experiences in ${cleanCityName}.`,
                image: item.imageUrl || item.wikiThumbnail || "needs-fetch" 
            };
        });

        return res.status(200).json({
            success: true,
            data: formattedItems,
            pagination: { currentPage: page, totalPages, totalItems, itemsPerPage: limit }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


const getDestinationAttractions = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ success: false, message: "Location 'name' is required." });
        }

        const cleanName = name.trim();

        // 1. Check DB Cache
        const destinationRecord = await collectionDestinations.findOne({
            city: { $regex: `^${cleanName}$`, $options: "i" }
        });

        if (destinationRecord && destinationRecord.attractions && destinationRecord.attractions.length > 0) {
            console.log(`[Cache Hit] Served attractions for: ${cleanName}`);
            return res.status(200).json({ success: true, source: 'cache', data: destinationRecord.attractions });
        }

        // 2. Fetch from API (Cache Miss)
        console.log(`[Cache Miss] Fetching Geoapify attractions for: ${cleanName}`);
        const attractions = await fetchAttractionsFromGeoapify(cleanName);

        // 3. Save to DB
        if (attractions && attractions.length > 0) {
            await collectionDestinations.updateOne(
                { city: { $regex: `^${cleanName}$`, $options: "i" } },
                {
                    $set: { city: cleanName, attractions: attractions },
                },
                { upsert: true }
            );
        }

        return res.status(200).json({ success: true, source: 'api', data: attractions || [] });
    } catch (error) {
        console.error("Error fetching destination attractions:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch attractions" });
    }
};


const getRecommendedDestinations = async (req, res) => {
    try {
        const { viewHistory } = req.body; 
        
        // Fallback if history is empty
        if (!viewHistory || !Array.isArray(viewHistory) || viewHistory.length === 0) {
            const fallbacks = await collectionDestinations.find({}).limit(4).toArray();
            return res.status(200).json({ success: true, data: fallbacks, basedOn: null });
        }

        // 1. Collect all viewed city names to avoid recommending places already seen
        const viewedSlugs = viewHistory.map(item => item.slug.toLowerCase().replace(/-/g, ' '));

        // 2. Identify the seed (most viewed) destination
        const topItem = [...viewHistory].sort((a, b) => b.count - a.count)[0];
        const seedName = topItem.slug.replace(/-/g, ' ');

        // 3. Find seed destination in DB
        const seedDest = await collectionDestinations.findOne({
            city: { $regex: `^${seedName.trim()}$`, $options: "i" }
        });

        let recommendations = [];

        if (seedDest) {
            // Build a flexible query matching country or continent
            const matchConditions = [];
            if (seedDest.country && seedDest.country !== "Unknown") {
                matchConditions.push({ country: { $regex: seedDest.country, $options: "i" } });
            }
            if (seedDest.continent) {
                matchConditions.push({ continent: { $regex: seedDest.continent, $options: "i" } });
            }

            // Query matching destinations, excluding already viewed cities
            if (matchConditions.length > 0) {
                recommendations = await collectionDestinations.find({
                    $and: [
                        { city: { $not: { $in: viewedSlugs.map(s => new RegExp(`^${s}$`, 'i')) } } },
                        { $or: matchConditions }
                    ]
                })
                .limit(4)
                .toArray();
            }
        }

        // 4. BACKFILL: If fewer than 4 recommendations are found, backfill with other top destinations
        if (recommendations.length < 4) {
            const existingIds = recommendations.map(r => r._id);
            const needed = 4 - recommendations.length;

            const extra = await collectionDestinations.find({
                _id: { $nin: existingIds },
                city: { $not: { $in: viewedSlugs.map(s => new RegExp(`^${s}$`, 'i')) } }
            })
            .limit(needed)
            .toArray();

            recommendations = [...recommendations, ...extra];
        }

        return res.status(200).json({ 
            success: true, 
            data: recommendations, 
            basedOn: seedDest ? seedDest.city : seedName.charAt(0).toUpperCase() + seedName.slice(1)
        });

    } catch (error) {
        console.error("Error generating recommendations:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Dedicated API for Destination Details "Similar Places"
const getSimilarDestinations = async (req, res) => {
    try {
        const { name, page = 1, limit = 4 } = req.query;
        
        if (!name) {
            return res.status(400).json({ success: false, message: "Location name is required" });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const safeName = name.trim();

        // 1. Find the current destination
        const currentDest = await collectionDestinations.findOne({
            city: { $regex: `^${safeName}$`, $options: "i" }
        });

        // 2. Build the filter
        let filter = { city: { $not: new RegExp(`^${safeName}$`, "i") } };

        if (currentDest && (currentDest.country || currentDest.continent)) {
            filter.$or = [];
            if (currentDest.country && currentDest.country !== "Unknown") {
                filter.$or.push({ country: { $regex: currentDest.country, $options: "i" } });
            }
            if (currentDest.continent) {
                filter.$or.push({ continent: { $regex: currentDest.continent, $options: "i" } });
            }
        }

        // 3. Try to fetch matching destinations
        let similar = await collectionDestinations.find(filter)
            .limit(parseInt(limit))
            .skip(skip)
            .toArray();

        let totalItems = await collectionDestinations.countDocuments(filter);

        // 4. THE FIX: Removed 'featured: true' because it doesn't exist in MongoDB!
        // Fallback to top continents to guarantee we always return beautiful cards.
        if (similar.length === 0) {
            console.log(`[Similar Destinations] No exact matches for ${safeName}. Using global fallback.`);
            
            filter = { 
                city: { $not: new RegExp(`^${safeName}$`, "i") },
                continent: { $in: ["Europe", "Asia", "North America"] }
            };
            
            similar = await collectionDestinations.find(filter)
                .limit(parseInt(limit))
                .skip(skip)
                .toArray();
                
            totalItems = await collectionDestinations.countDocuments(filter);
        }

        // 5. Enforce Max 20 Pagination Rule
        totalItems = Math.min(totalItems, 20); 
        const totalPages = Math.ceil(totalItems / limit);

        if (skip >= 20) {
            return res.status(200).json({ success: true, data: [], pagination: { currentPage: parseInt(page), totalPages, totalItems } });
        }

        // 6. Format for the frontend DestinationCard
        const formattedItems = similar.map((item) => {
            const cleanCityName = item.city ? item.city.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "Unknown";
            return {
                id: item._id,
                name: cleanCityName,
                slug: cleanCityName.toLowerCase().replace(/\s+/g, '-'),
                country: item.country || "Global",
                rating: item.rating || "4.8",
                description: item.description || `Explore scenic spots, cultural heritage, and local experiences in ${cleanCityName}.`,
                image: item.imageUrl || item.wikiThumbnail || "needs-fetch"
            };
        });

        res.status(200).json({
            success: true,
            data: formattedItems,
            pagination: { currentPage: parseInt(page), totalPages, totalItems }
        });

    } catch (error) {
        console.error("Similar Destinations API Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDestinationInfo,
    getAutocompleteSuggestions,
    getDestinationWeather,
    getDestinationCardInfo,
    getPaginatedDestinations,
    getDestinationAttractions,
    getRecommendedDestinations,
    getSimilarDestinations
};

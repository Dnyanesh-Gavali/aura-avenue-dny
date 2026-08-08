require("dotenv").config({ path: "../.env" }); // Ensure path to .env is correct if running from seed folder
const { connectDB, collectionDestinations } = require("../config/db");
const { fetchLocation } = require("../services/wikiService");

async function cacheDestinationImages() {
    try {
        await connectDB();
        console.log("Connected to MongoDB...");

        // Find destinations that do NOT have a wikiThumbnail cached yet
        const destinations = await collectionDestinations.find({
            wikiThumbnail: { $exists: false },
            $or: [
                { featured: true },
                { country: "India" } // Or any specific popular country/continent
            ]
        }).toArray();
        console.log(`Found ${destinations.length} destinations to process.`);

        let count = 1;
        for (const dest of destinations) {
            console.log(`[${count} / ${destinations.length}] Fetching Wiki image for: ${dest.city}...`);

            try {
                // Fetch from your existing Wikipedia service
                const wikiData = await fetchLocation(dest.city);

                if (wikiData && wikiData.thumbnail) {
                    // Update MongoDB with the thumbnail URL
                    await collectionDestinations.updateOne(
                        { _id: dest._id },
                        { $set: { wikiThumbnail: wikiData.thumbnail } }
                    );
                    console.log(`  -> Successfully saved thumbnail for ${dest.city}!`);
                } else {
                    console.log(`  -> No thumbnail found on Wikipedia for ${dest.city}`);
                    // Save a fallback image so the frontend doesn't keep trying to fetch it
                    await collectionDestinations.updateOne(
                        { _id: dest._id },
                        { $set: { wikiThumbnail: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800&w=600&h=400&fit=crop&q=70" } }
                    );
                }
            } catch (apiError) {
                console.error(`  -> API Error for ${dest.city}:`, apiError.message);
            }

            // IMPORTANT LIMITER: Wait 2 seconds to avoid Wikipedia rate limits/blocks
            await new Promise((resolve) => setTimeout(resolve, 2000));
            count++;
        }

        console.log(" All destination images pre-fetched and cached successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Batch update failed:", error);
        process.exit(1);
    }
}

cacheDestinationImages();
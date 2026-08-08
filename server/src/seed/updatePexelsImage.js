require("dotenv").config();
const { connectDB, collectionPackages } = require("../config/db");
const { fetchImageFromPexels } = require("../services/pexelsService");

async function updateAllPackageImages() {
    try {
        await connectDB();
        console.log("Connected to MongoDB...");

        const packages = await collectionPackages.find({}).toArray();
        console.log(`Found ${packages.length} packages to check...`);

        for (const pkg of packages) {
            console.log(`Fetching Pexels image for: ${pkg.title} (${pkg.location})...`);
            const pexelsUrl = await fetchImageFromPexels(pkg.location || pkg.title);

            if (pexelsUrl) {
                await collectionPackages.updateOne(
                    { _id: pkg._id },
                    { $set: { image: pexelsUrl } }
                );
                console.log(`  Updated: ${pkg.title}`);
            } else {
                console.log(`❌ Skipping: ${pkg.title} (No image found)`);
            }

            // Small delay to respect rate limits during bulk updates
            await new Promise((resolve) => setTimeout(resolve, 300));
        }

        console.log(" All MongoDB packages updated successfully with Pexels images!");
        process.exit(0);
    } catch (error) {
        console.error("Batch update failed:", error);
        process.exit(1);
    }
}

updateAllPackageImages();
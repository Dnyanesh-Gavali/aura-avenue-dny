require("dotenv").config();

const { connectDB, collectionPackages } = require("../config/db");
const packages = require("./packagesData");

async function seedPackages() {
    try {
        // Connect to MongoDB
        await connectDB();

        console.log("Connected to MongoDB");

        // Remove existing packages
        await collectionPackages.deleteMany({});
        console.log("Old packages deleted");

        // Insert new packages
        const result = await collectionPackages.insertMany(packages);

        console.log(`${result.insertedCount} packages inserted successfully`);

        process.exit(0);

    } catch (err) {
        console.error("Seed Error:", err);

        process.exit(1);
    }
}

seedPackages();
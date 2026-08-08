// Fixes 'querySrv ECONNREFUSED' issue by forcing IPv4 resolution first
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require("dotenv").config();
const { MongoClient } = require("mongodb");

// Initialize MongoDB Client
const client = new MongoClient(process.env.MONGODB_URI);

// 1. Establish connections to both separate databases inside your cluster
const dbAuth = client.db("WebWonder");
const dbDest = client.db("DestinationsNameForSearch");

// 2. Map the collections to their respective databases
const collectionUserData = dbAuth.collection("UserData");
const collectionOtps = dbAuth.collection("Otps");
const collectionDestinations = dbDest.collection("Destinations");
const collectionPackages = dbAuth.collection("Packages");
const collectionBookings = dbAuth.collection("Bookings");
const collectionQuries = dbAuth.collection("Queries");
const collectionNotifications = dbAuth.collection("Notification");

/**
 * Connects to MongoDB Atlas Cluster and ensures indexes are created
 */
async function connectDB() {
    try {
        await client.connect();
        console.log("MongoDB Connected to Atlas Cluster successfully.");

        // Compound Index for lightning-fast 10k+ pagination & filtering (<5ms query time)
        await collectionDestinations.createIndex({ continent: 1, country: 1, city: 1 });
    } catch (err) {
        console.error("MongoDB Connection Failed:", err.message);
    }
}

module.exports = {
    connectDB,
    db: dbDest, // Keeps a default 'db' export targeting your cities for the autocomplete controller
    dbAuth,     // Exported in case you need direct db manipulation later
    collectionUserData,
    collectionOtps,
    collectionDestinations, // Exported so controllers can explicitly query the dataset
    collectionPackages,
    collectionBookings,
    collectionQuries,          // Exported for logging user queries
    collectionNotifications    // Exported for handling notifications
};
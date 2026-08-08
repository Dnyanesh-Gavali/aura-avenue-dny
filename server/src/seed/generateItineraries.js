require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { connectDB, collectionPackages } = require("../config/db");

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateItineraries() {
    try {
        await connectDB();
        console.log("Connected to MongoDB...");

        const packages = await collectionPackages.find({
            "itinerary.0": { $not: /\./ }
        }).toArray();

        console.log(`Found ${packages.length} packages to process.`);
        let count = 1;
        for (const pkg of packages) {
            // Extract the number of days from the duration string (e.g., "5 Days / 4 Nights" -> 5)
            const match = String(pkg.duration).match(/\d+/);
            const numDays = match ? parseInt(match[0], 10) : 3; // Default to 3 if not found
            console.log(`[${count} / ${packages.length}] Generating ${numDays}-day itinerary for: ${pkg.title}...`);

            const prompt = `
Create a realistic and exciting day-wise itinerary for a ${numDays}-day tour package.

Package Title: ${pkg.title}
Locations: ${pkg.location}

Requirements:
- Return EXACTLY ${numDays} itinerary items.
- Each item represents one complete day of the trip.
- Each item MUST contain exactly 2 short sentences.
- Keep each sentence approximately 5 words long.
- Mention important attractions, activities, or experiences.
- Include local food, culture, nature, shopping, or leisure where appropriate.
- Use only real and well-known tourist attractions.
- Do not invent attractions or locations.
- Do not repeat the same attraction on different days.
- Keep activities geographically realistic.
- If there are multiple locations, distribute the days logically among them.
- Account for travel between different locations.
- Make the first and last days realistic for arrival, departure, or transfers where appropriate.
- Do NOT include "Day 1", "Day 2", etc.
- Do NOT include headings or explanations.

Return ONLY a valid JSON array of strings.
The array MUST contain exactly ${numDays} strings.

Example for a 3-day Delhi, Agra, Jaipur package:
[
  "Explore India Gate and surroundings. Experience Delhi's vibrant local culture.",
  "Visit the magnificent Taj Mahal. Discover Agra's rich Mughal heritage.",
  "Explore Amber Fort's royal architecture. Experience Jaipur's colorful local markets."
]
`;
            try {
                // Call Gemini 2.5 Flash with strict JSON Schema output
                const response = await ai.models.generateContent({
                    model: "gemini-3.5-flash-lite",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: "array",
                            description: `List of exactly ${numDays} daily itinerary descriptions.`,
                            items: {
                                type: "string"
                            }
                        }
                    }
                });

                const generatedItinerary = JSON.parse(response.text);

                if (Array.isArray(generatedItinerary) && generatedItinerary.length > 0) {
                    // Permanently update the package in MongoDB
                    await collectionPackages.updateOne(
                        { _id: pkg._id },
                        { $set: { itinerary: generatedItinerary } }
                    );
                    console.log(`  -> Successfully updated ${pkg.title}!`);
                } else {
                    console.log(`  -> Failed to parse valid array for ${pkg.title}`);
                }

            } catch (apiError) {
                console.error(`  -> Gemini API Error for ${pkg.title}:`, apiError.message);
            }

            // IMPORTANT LIMITER: 
            // The free tier allows 15 requests per minute. 
            // Waiting 4.5 seconds between each loop guarantees you stay under the limit.
            await new Promise((resolve) => setTimeout(resolve, 4500));
            count++;
        }

        console.log("✅ All itineraries generated and saved successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Batch update failed:", error);
        process.exit(1);
    }
}

generateItineraries();
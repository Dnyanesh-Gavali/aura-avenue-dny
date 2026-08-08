require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { connectDB, collectionPackages } = require("../config/db");

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateAbouts() {
    try {
        await connectDB();
        console.log("Connected to MongoDB...");

        // Only fetch packages that do NOT have an 'about' field yet
        const packages = await collectionPackages.find({
            about: { $exists: false }
        }).toArray();

        console.log(`Found ${packages.length} packages to process.`);

        let count = 1;

        for (const pkg of packages) {
            console.log(`[${count} / ${packages.length}] Generating description for: ${pkg.title}...`);

            // Format the itinerary array into a clean bulleted list for the AI to read easily
            const itineraryList = Array.isArray(pkg.itinerary) 
                ? pkg.itinerary.join("\n- ") 
                : "No itinerary provided.";

            const prompt = `
Write a detailed, engaging, and realistic "About" description for the following travel package.

Package Title: ${pkg.title}
Location(s): ${pkg.location}
Duration: ${pkg.duration}
Package Type: ${pkg.type}
Itinerary: 
- ${itineraryList}

Requirements:
- Write approximately 7 to 8 sentences.
- Write everything as one well-flowing paragraph.
- Begin with an engaging introduction to the destination and overall journey.
- Describe the major destinations, attractions, and experiences included in the itinerary.
- Base the description primarily on the provided itinerary.
- Naturally summarize the journey instead of describing every day separately.
- Mention important attractions from the itinerary where appropriate.
- Highlight the destination's culture, scenery, heritage, food, nature, or atmosphere when relevant.
- If the package contains multiple locations, describe how the journey moves through and connects those destinations.
- Match the writing style to the package type. For example:
  - Adventure packages should feel energetic and exciting.
  - Honeymoon packages should feel romantic and relaxing.
  - Cultural packages should emphasize heritage and local experiences.
  - Family packages should feel comfortable, enjoyable, and suitable for families.
- Keep the tone polished and appealing, similar to a professional travel agency.
- Do not invent attractions or activities that are not supported by the package information or itinerary.
- Do not mention specific hotels, prices, transportation services, or inclusions unless provided in the package data.
- Avoid repeating the same information or attraction multiple times.
- Do not use headings, bullet points, markdown, or asterisks.
- Return ONLY the final plain-text paragraph with no additional explanation.
`;

            try {
                // Call the high-volume Flash-Lite model
                const response = await ai.models.generateContent({
                    model: "gemini-3.5-flash-lite",
                    contents: prompt
                });

                const generatedAbout = response.text.trim();

                if (generatedAbout && generatedAbout.length > 20) {
                    // Permanently save the new 'about' paragraph in MongoDB
                    await collectionPackages.updateOne(
                        { _id: pkg._id },
                        { $set: { about: generatedAbout } }
                    );
                    console.log(`  -> Successfully updated ${pkg.title}!`);
                } else {
                    console.log(`  -> Failed to generate valid description for ${pkg.title}`);
                }

            } catch (apiError) {
                console.error(`  -> Gemini API Error for ${pkg.title}:`, apiError.message);
            }

            // IMPORTANT LIMITER: Wait 4.5 seconds to stay under the 15 Requests-Per-Minute limit
            await new Promise((resolve) => setTimeout(resolve, 4500));
            
            count++;
        }

        console.log("✅ All package descriptions generated and saved successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Batch update failed:", error);
        process.exit(1);
    }
}

generateAbouts();
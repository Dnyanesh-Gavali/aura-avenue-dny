const axios = require('axios');

function generateTravelCaption(title, description, extract) {
    const isIrrelevant = /weaponry|disambiguation|genus|species|military/i.test(description || "");
         
    if (description && !isIrrelevant) {
        const formattedDesc = description.charAt(0).toUpperCase() + description.slice(1);
        return `${formattedDesc}. Discover top landmarks, rich culture, and unforgettable experiences in ${title}.`;
    }
         
    if (extract) {
        const firstSentence = extract.split('.')[0];
        if (firstSentence && firstSentence.length < 120 && !isIrrelevant) {
            return `${firstSentence}. Perfect destination for your next getaway.`;
        }
    }
    return `Discover ${title} - a scenic destination offering rich heritage, vibrant local culture, and breathtaking views.`;
}

async function fetchLocation(locationName) {
    try {
        const queryTitle = locationName.trim();
        
        // STEP 1: ALWAYS try the exact title match first!
        // Using pithumbsize=600 for faster, optimized loading
        let wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages|description|coordinates&titles=${encodeURIComponent(queryTitle)}&explaintext=true&exsentences=10&pithumbsize=600&redirects=1`;
                 
        let response = await axios.get(wikiUrl, {
            headers: { "User-Agent": "AuraAvenue/1.0 (dnycoder07@gmail.com)" }
        });
        
        let pages = response.data.query.pages;
        let pageId = Object.keys(pages)[0];
        let pageData = pages[pageId];

        // STEP 2: Check if exact match failed, or if it returned something non-travel related
        const isIrrelevant = pageId === "-1" || /weaponry|disambiguation|genus|species/i.test(pageData?.description || "");

        // STEP 3: ONLY run a broad search if the exact match was bad
        if (isIrrelevant) {
            // Fallback: strictly look for the name + city context
            const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(queryTitle + ' city')}&utf8=&format=json&srlimit=1`;
            
            const searchRes = await axios.get(searchUrl, {
                headers: { "User-Agent": "AuraAvenue/1.0 (dnycoder07@gmail.com)" }
            });
            
            if (searchRes.data?.query?.search?.length > 0) {
                const newTitle = searchRes.data.query.search[0].title;
                
                // Fetch the real page for the corrected title
                // Using pithumbsize=600 here as well
                wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages|description|coordinates&titles=${encodeURIComponent(newTitle)}&explaintext=true&exsentences=10&pithumbsize=600&redirects=1`;
                
                response = await axios.get(wikiUrl, { headers: { "User-Agent": "AuraAvenue/1.0 (dnycoder07@gmail.com)" } });
                pages = response.data.query.pages;
                pageId = Object.keys(pages)[0];
                pageData = pages[pageId];
            }
        }

        if (!pageData || pageId === "-1") return null;

        return {
            title: pageData.title,
            description: pageData.description || "Travel Destination",
            travelCaption: generateTravelCaption(pageData.title, pageData.description, pageData.extract),
            extract: pageData.extract || "No detailed information available.",
            thumbnail: pageData.thumbnail ? pageData.thumbnail.source : null,
            wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageData.title.replace(/ /g, "_"))}`
        };
    } catch (error) {
        console.error("Error fetching Wikipedia info:", error.message);
        throw error;
    }
}
module.exports = { fetchLocation };
import React, { useEffect, useState } from 'react'
import DestDetHero from '../../components/DestinationDetailPageComponents/DestDetHero'
import { images } from '../../data-destination/imageUrls'
import DestDetTabs from '../../components/DestinationDetailPageComponents/DestDetTabs'
import { useParams } from 'react-router-dom'
import { destinations } from '../../data-destination/destinations'
import DestDetWeather from '../../components/DestinationDetailPageComponents/DestDetWeather'

const DestinationDetailes = () => {

    const { slug } = useParams();
    const [destData, setDestData] = useState(null)
    const [loading, setLoading] = useState(true)
    const destination = destinations.find(
        (d) => d.slug === slug
    );



    useEffect(() => {
        const fetchDestination = async () => {
            setLoading(true)

            // 1. Find local data if it exists (for ratings & featured flags)
            const localData = destinations.find(
                (d) => d.slug.toLowerCase() === slug.toLowerCase() || d.slug.replace(/-/g, '') === slug.toLowerCase()
            );

            // 2. Format the search term for Wikipedia!
            // If local data exists, use the exact name (e.g., "Swiss Alps"). 
            // If not, try to clean up the URL slug by replacing hyphens with spaces.
            const rawSearchTerm = localData
                ? (localData.wikiTitle || localData.name)
                : slug.replace(/-/g, ' ');

            const wikiSearchTerm = rawSearchTerm
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, "");

            try {
                // 2. Fetch live data from your Wikipedia API backend
                const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/destinations/info?name=${wikiSearchTerm}`);
                const apiData = await res.json();

                if (apiData.success) {
                    setDestData({
                        name: apiData.data.title || localData?.name || slug,
                        country: apiData.data.description || localData?.country || 'Global Destination',
                        caption: apiData.data.caption || apiData.data.travelCaption, // Set caption here
                        image: apiData.data.heroImage || localData?.image,
                        rating: localData?.rating || 'New',
                        about: apiData.data.extract || localData?.description
                    });
                }

                else if (localData) {
                    // Fallback to local data if Wikipedia API doesn't find it
                    setDestData({
                        ...localData,
                        about: localData.description
                    });
                }

                else {
                    // FIX: Create a generic profile instead of failing completely
                    const formattedName = slug
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');

                    setDestData({
                        name: formattedName,
                        country: "Custom Destination",
                        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800', // Generic hero image
                        rating: 'New',
                        about: "Detailed Wikipedia information is currently unavailable for this specific location, but you can explore its exact coordinates on the map!"
                    });
                }
            }

            catch (error) {
                console.error("Error fetching Wiki data", error);

                // Fallback to local if server is down
                if (localData) setDestData({ ...localData, about: localData.description });
                else setDestData(null);
            }

            finally {
                setLoading(false);
            }
        }

        fetchDestination()
    }, [slug]);



    useEffect(() => {
        if (!slug) return;

        // 1. Get existing history from Local Storage
        const VIEW_HISTORY_KEY = "auraavenue:viewHistory";
        let history = [];
        try {
            history = JSON.parse(window.localStorage.getItem(VIEW_HISTORY_KEY)) || [];
        } catch (e) {
            history = [];
        }

        // 2. Check if this slug is already in history
        const existingIndex = history.findIndex(item => item.slug === slug);

        if (existingIndex >= 0) {
            // Increment view count if it exists
            history[existingIndex].count += 1;
            history[existingIndex].lastViewed = Date.now();
        } else {
            // Add new destination to history
            history.push({ slug, count: 1, lastViewed: Date.now() });
        }

        // 3. Keep only the top 10 most viewed to save local storage space
        history.sort((a, b) => b.lastViewed - a.lastViewed);
        if (history.length > 10) history = history.slice(0, 10);

        // 4. Save back to Local Storage
        window.localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(history));
    }, [slug]);


    if (loading) return <div className="flex h-screen items-center justify-center text-3xl font-bold text-gray-500">Loading Destination...</div>;
    if (!destData) return <div className="flex h-screen items-center justify-center text-3xl font-bold text-red-500">Destination Not Found</div>;

    return (
        <>
            <DestDetHero
                heroImage={destData.image}
                name={destData.name}
                country={destData.country}
                caption={destData.caption}
                rating={destData.rating}
            />


            {/* Pass the newly fetched Wikipedia extract down to the Tabs component */}
            <DestDetTabs
                aboutText={destData.about}
                locationName={destData.name}
                caption={destData.country}
            />
        </>
    )
}

export default DestinationDetailes

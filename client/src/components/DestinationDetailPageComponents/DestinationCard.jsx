import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

const DestinationCard = ({
    slug,
    name,
    country,
    description,
    image: initialImage,
    rating,
    featured,
}) => {
    const navigate = useNavigate();
    
    // 1. Recognize the backend's "needs-fetch" string or the old picsum placeholders
    const isPlaceholder = !initialImage || initialImage === "needs-fetch" || initialImage.includes("picsum.photos");
    
    const [cardImage, setCardImage] = useState(isPlaceholder ? null : initialImage);
    const cardRef = useRef(null);

    useEffect(() => {
        // If it already has a real image from the DB, do nothing!
        if (!isPlaceholder) return;

        // 2. Set up the Intersection Observer for lazy loading
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    const fetchWikiImage = async () => {
                        try {
                            // Hit the CARD-ONLY endpoint (No Unsplash rate limits!)
                            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/destinations/card-info?name=${name}`);
                            const apiData = await res.json();
                            
                            if (apiData.success && apiData.image) {
                                let finalImageUrl = apiData.image;

                                // Optimize the image on the fly if it came from the Unsplash Cache
                                if (apiData.source === 'unsplash' && finalImageUrl.includes('unsplash.com')) {
                                    const baseUrl = finalImageUrl.split('&w=')[0]; 
                                    finalImageUrl = `${baseUrl}&w=600&h=400&fit=crop&q=70&auto=format`;
                                }
                                
                                setCardImage(finalImageUrl);
                            } else {
                                setCardImage("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800");
                            }
                        } catch (error) {
                            console.error(`Error fetching image for ${name}:`, error);
                            setCardImage("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800");
                        }
                    };
                    
                    fetchWikiImage();
                    // Disconnect the observer so it only fetches once
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => {
            if (cardRef.current) observer.unobserve(cardRef.current);
        };
    }, [isPlaceholder, name]);

    return (
        <div ref={cardRef} className="min-w-[280px] max-w-[280px] rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
            {/* Image Section */}
            <div className="relative bg-gray-200" style={{ height: "180px" }}>
                {cardImage ? (
                    <img
                        src={cardImage}
                        alt={name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-opacity duration-500"
                    />
                ) : (
                    // Skeleton loader
                    <div className="flex h-full w-full animate-pulse items-center justify-center bg-slate-200">
                        <span className="text-sm font-medium text-slate-400">Loading image...</span>
                    </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold shadow">
                    ⭐ {rating}
                </div>
            </div>

            {/* Description Section */}
            <div className='flex flex-col flex-1 p-4 text-center'>
                {featured && (
                    <span className="inline-flex items-center self-center gap-1 rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
                        🔥 Trending
                    </span>
                )}
                <div className="mt-4 space-y-2">
                    <div className="font-bold text-xl mb-2">{name}</div>
                    <div className="font-semibold text-lg text-emerald-700">{country}</div>
                    <p className="text-gray-600 leading-relaxed text-sm font-medium mt-2 line-clamp-3">
                        {description}
                    </p>
                </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center mt-auto pt-4 pb-5">
                <button
                    onClick={() => navigate(`/destinations/${slug}`)}
                    className="group mt-2 mb-4 cursor-pointer flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600">
                    <span>Explore</span>
                    <svg
                        className="w-6 h-6 transition-transform duration-300 group-hover:rotate-45"
                        viewBox="0 0 25 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M9 8.5H16.5V16" stroke="white" strokeWidth="1.8" />
                        <path d="M16.5 8.5L7 18" stroke="white" strokeWidth="1.8" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default DestinationCard;
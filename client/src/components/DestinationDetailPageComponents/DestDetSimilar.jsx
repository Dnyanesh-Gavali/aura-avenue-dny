import React, { useState, useEffect } from 'react';
import DestinationCard from './DestinationCard';

const DestDetSimilar = ({ locationName }) => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!locationName) return;
        
        const fetchSimilar = async () => {
            setLoading(true);
            try {
                // Fetch exactly 4 items per page
                const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/destinations/similar?name=${encodeURIComponent(locationName)}&page=${page}&limit=4`);
                const data = await res.json();
                
                if (data.success) {
                    setDestinations(data.data);
                    setTotalPages(data.pagination.totalPages);
                }
            } catch (error) {
                console.error("Error fetching similar destinations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSimilar();
    }, [locationName, page]);

    // Don't render the section if no similar destinations exist
    if (destinations.length === 0 && !loading) return null;

    return (
        <section className="mt-16 p-8 md:p-12 rounded-[50px] bg-emerald-50 border border-emerald-100 shadow-[20px_20px_35px_#ecebeb,-20px_-20px_35px_#ffffff]">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Similar Destinations</h2>
                    <p className="mt-2 text-gray-600 font-medium">Keep exploring places similar to {locationName}.</p>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex gap-3">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-emerald-200 text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-500 shadow-sm cursor-pointer"
                        >
                            &larr;
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-emerald-200 text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-500 shadow-sm cursor-pointer"
                        >
                            &rarr;
                        </button>
                    </div>
                )}
            </div>

            {/* Exactly 4 Cards Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[350px]">
                {loading ? (
                    // 4 Skeleton Loaders matching the 4 grid spots
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="h-[380px] w-full bg-white animate-pulse rounded-2xl border border-gray-100 shadow-sm"></div>
                    ))
                ) : (
                    destinations.map(dest => (
                        <div key={dest.id} className="w-full flex justify-center">
                            <DestinationCard {...dest} />
                        </div>
                    ))
                )}
            </div>
            
            {/* Page Indicator */}
            {totalPages > 1 && !loading && (
                <div className="text-center mt-8 text-sm font-semibold text-emerald-600/70 uppercase tracking-widest">
                    Page {page} of {totalPages}
                </div>
            )}
        </section>
    );
};

export default DestDetSimilar;
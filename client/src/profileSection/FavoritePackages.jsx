import React from 'react';
import { FaHeart, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Utility: Converts package title into a clean URL-friendly slug
const createSlug = (title) => {
    if (!title) return "";
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// Component: FavoritePackages
// Purpose: Displays the list of tour/travel packages saved to the user's favorites list.
const FavoritePackages = ({ userData, refreshProfile }) => {
    // Read favorites directly from user data passed via props
    const favorites = userData?.favorites || [];

    // Logic: Removes a package from favorites via API and triggers a profile refresh
    const removeFavorite = async (pkg) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/toggle-favorite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ packageData: pkg })
            });
            const data = await res.json();
            if (data.success) {
                refreshProfile(); // Instantly refresh UI state from database
            }
        } catch (err) {
            console.error("Error removing favorite package:", err);
        }
    };

    return (
        <div className="w-full space-y-4 sm:space-y-6 box-border">
            {/* Main Outer Container */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm box-border">
                
                {/* Section Header */}
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-3 border-gray-100 flex items-center gap-2">
                    Favorite Packages
                </h3>

                {/* EMPTY STATE: Shown when user has no favorited packages */}
                {favorites.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 box-border">
                        <FaHeart className="mx-auto text-3xl sm:text-4xl text-gray-300 mb-3" />
                        <p className="text-sm sm:text-base text-gray-500 font-medium">You haven't favorited any packages yet.</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Click the heart icon on any package to save it here.</p>
                        <Link 
                            to="/packages" 
                            className="inline-block mt-4 bg-emerald-50 text-[#167A44] px-5 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-emerald-100 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#167A44]"
                        >
                            Browse Packages
                        </Link>
                    </div>
                ) : (
                    /* GRID CONTAINER: Displays cards in 1 col (mobile), 2 cols (tablet), 3 cols (desktop) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {favorites.map(pkg => (
                            /* Individual Package Card */
                            <div 
                                key={pkg.id || pkg._id} 
                                className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow duration-200 ease-in-out flex flex-col justify-between box-border"
                            >
                                {/* Card Header Image & Favorite Toggle Overlay */}
                                <div className="h-44 sm:h-48 bg-gray-200 relative w-full overflow-hidden">
                                    <img 
                                        src={pkg.image} 
                                        alt={pkg.title || "Package Image"} 
                                        className="w-full h-full object-cover" 
                                    />
                                    {/* Unfavorite / Remove Button */}
                                    <button
                                        type="button"
                                        aria-label="Remove from favorites"
                                        onClick={() => removeFavorite(pkg.id || pkg._id)}
                                        className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2.5 sm:p-3 rounded-full shadow-md text-red-500 hover:scale-110 active:scale-95 transition-transform duration-200 ease-in-out focus:outline-none"
                                    >
                                        <FaHeart className="text-sm sm:text-base" />
                                    </button>
                                </div>

                                {/* Card Body Information */}
                                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        {/* Package Title */}
                                        <h4 className="font-bold text-gray-900 text-base sm:text-lg truncate" title={pkg.title}>
                                            {pkg.title}
                                        </h4>
                                        {/* Package Location */}
                                        <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 mt-1 font-medium truncate">
                                            <FaMapMarkerAlt className="text-[#167A44] shrink-0" /> 
                                            <span className="truncate">{pkg.location}</span>
                                        </p>
                                    </div>

                                    {/* Card Footer: Price & Details Link */}
                                    {/* flex-wrap prevents overlapping on small viewports */}
                                    <div className="mt-4 sm:mt-5 flex flex-wrap justify-between items-center border-t border-gray-100 pt-3 sm:pt-4 gap-2">
                                        <span className="font-extrabold text-[#167A44] text-base sm:text-lg">
                                            ₹{pkg.price?.toLocaleString()}
                                        </span>
                                        <Link 
                                            to={`/packages/details/${createSlug(pkg.title)}`} 
                                            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 ease-in-out"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritePackages;
import {
    FaStar,
    FaMapMarkerAlt,
    FaClock,
    FaHotel,
    FaPlane,
    FaUtensils,
    FaArrowRight,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

function PackageCard({ packageData, onBookNow, isSlider }) {
    // 1. DYNAMIC WRAPPER: If it's a slider, completely bypass Framer Motion overhead using a native div.
    const CardContainer = isSlider ? "div" : motion.div;

    const [isLiked, setIsLiked] = useState(false);
    useEffect(() => {
        const checkLikedStatus = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/get-user-data`, {
                    method: "POST",
                    credentials: "include", // Sends the JWT cookie
                    headers: { "Content-Type": "application/json" }
                });
                const data = await res.json();
                if (data.success && data.user.favorites) {
                    const exists = data.user.favorites.some(fav =>
                        (packageData._id && fav._id === packageData._id) ||
                        (packageData.id && fav.id === packageData.id)
                    );
                    setIsLiked(exists);
                }
            } catch (err) {
                // User likely not logged in, ignore silently
            }
        };
        checkLikedStatus();
    }, [packageData.id, packageData._id]);

    // 2. Only apply motion props if it's in the grid view
    const motionProps = isSlider
        ? {}
        : { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

    return (
        <CardContainer
            {...motionProps}
            // 3. PERFORMANCE FIXES: 
            // - Replaced `transition-all` with `transition-[transform,box-shadow]`
            // - Added `transform-gpu` to force Hardware Acceleration (GPU rendering)
            className="group flex flex-col h-full overflow-hidden rounded-[32px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.15)] hover:scale-[1.02] hover:-translate-y-1 transition-[transform,box-shadow] duration-300 transform-gpu"
        >
            {/* Image */}
            <div className="relative overflow-hidden rounded-t-[32px] bg-gray-100">
                <img
                    src={packageData.image}
                    alt={packageData.title}
                    loading="lazy"
                    // Added will-change-transform to smooth out the image hover scale
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform"
                />

                <div className="absolute top-4 right-4 flex items-center gap-3">
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            try {
                                // Update MongoDB
                                const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/toggle-favorite`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    credentials: "include",
                                    body: JSON.stringify({ packageData })
                                });
                                const data = await res.json();
                                if (data.success) {
                                    setIsLiked(data.isLiked); // UI instantly updates to match database
                                } else {
                                    alert(data.message); // Alerts "Please log in to save favorites"
                                }
                            } catch (err) {
                                console.error(err);
                            }
                        }}
                        className="bg-white/80 backdrop-blur-md border border-white transition-all duration-300 rounded-full p-2.5 shadow-sm hover:scale-110 z-10 text-red-500"
                    >
                        {isLiked ? "❤️" : "🤍"}
                    </button>
                    {/* Badge */}
                    <div className="bg-emerald-600/95 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
                        {packageData.badge}
                    </div>
                </div>

                {/* Rating */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-white px-3 py-2 rounded-full flex items-center gap-1.5 shadow-sm">
                    <FaStar className="text-yellow-500 text-sm" />
                    <span className="font-bold text-sm text-gray-800">
                        {packageData.rating}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-7 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                    {packageData.title}
                </h3>

                <div className="flex items-center gap-2 text-gray-500 mt-3 font-medium">
                    <FaMapMarkerAlt className="text-emerald-500" />
                    <span>{packageData.location}</span>
                </div>

                <div className="flex items-center gap-2 mt-2 text-gray-500 font-medium">
                    <FaClock className="text-emerald-500" />
                    <span>{packageData.duration}</span>
                </div>

                {/* Features (Pills) */}
                <div className="flex flex-wrap gap-2 mt-5">
                    {packageData.features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-md"
                        >
                            {feature === "Hotel" && <FaHotel className="text-gray-400" />}
                            {feature === "Flight" && <FaPlane className="text-gray-400" />}
                            {(feature === "Breakfast" || feature === "Meals") && (
                                <FaUtensils className="text-gray-400" />
                            )}
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>

                {/* Price & Booking Button */}
                <div className="mt-auto pt-8">
                    <div>
                        <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                            Starting From
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                                ₹ {packageData.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-gray-400 font-medium">/ pp</span>
                        </div>
                        <p className="text-gray-400 line-through text-sm mt-1">
                            ₹ {packageData.originalPrice.toLocaleString()}
                        </p>
                    </div>

                    <button
                        onClick={() => onBookNow(packageData)}
                        className="mt-6 w-full rounded-2xl py-3.5 font-bold text-lg text-white flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md hover:shadow-xl transition-all duration-300"
                    >
                        View Details
                        <FaArrowRight className="text-sm" />
                    </button>
                </div>
            </div>
        </CardContainer>
    );
}

export default PackageCard;
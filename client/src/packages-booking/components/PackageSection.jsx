import { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import PackageCard from "./PackageCard";

function PackageSection({
    title,
    packages,
    onBookNow
}) {
    const scrollRef = useRef(null);
    
    // State to toggle between slider view and grid view
    const [showAll, setShowAll] = useState(false);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: -420,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: 420,
                behavior: "smooth",
            });
        }
    };

    // Derived boolean to tell the card if it's currently inside a slider
    const isSlider = !showAll;

    return (
        <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                    {title}
                </h2>
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-green-600 font-semibold hover:text-green-700 hover:underline transition"
                >
                    {showAll ? "Show Less ↑" : "See All →"}
                </button>
            </div>

            {showAll ? (
                // Responsive Grid View
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
                    {packages.map((item, index) => (
                        <div key={item._id || item.id || index} className="w-full flex justify-center">
                            <PackageCard
                                packageData={item}
                                onBookNow={onBookNow}
                                isSlider={isSlider}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                // Horizontal Slider View
                <div className="relative">
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center hover:bg-green-600 hover:text-white transition"
                    >
                        <FaChevronLeft />
                    </button>
                    
                    {/* Added willChange style to prepare the browser for smooth scrolling */}
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory px-4 py-4"
                        style={{ willChange: "scroll-position" }}
                    >
                        {packages.map((item, index) => (
                            <div
                                key={item._id || item.id || index}
                                // Added transform-gpu here to ensure the container itself is hardware accelerated
                                className="min-w-[320px] max-w-[320px] flex-shrink-0 snap-start transform-gpu"
                            >
                                <PackageCard
                                    packageData={item}
                                    onBookNow={onBookNow}
                                    isSlider={isSlider}
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={scrollRight}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center hover:bg-green-600 hover:text-white transition"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            )}
        </section>
    );
}

export default PackageSection;
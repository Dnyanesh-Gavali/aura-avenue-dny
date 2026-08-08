import { useState, useRef, useEffect } from "react";
import PackageFilter from "../components/PackageFilter";
import PackageSection from "../components/PackageSection";
import { motion } from "framer-motion";
import { images } from "../data/imageUrls";
import Navbar from "../../homepage/Navbar";

function Packages({ packages, loading, error, onRetry, onBookNow }) {
    // --- 1. STATE INITIALIZATION (Persisted via sessionStorage) ---
    // Lazily load states from sessionStorage so filters survive page navigation
    const [selectedCategory, setSelectedCategory] = useState(() => sessionStorage.getItem("pkg_category") || null);
    const [searchInput, setSearchInput] = useState(() => sessionStorage.getItem("pkg_searchInput") || "");
    const [appliedSearch, setAppliedSearch] = useState(() => sessionStorage.getItem("pkg_appliedSearch") || "");
    const [filters, setFilters] = useState(() => {
        const savedFilters = sessionStorage.getItem("pkg_filters");
        return savedFilters ? JSON.parse(savedFilters) : {
            destination: "",
            budget: "",
            duration: "",
            category: ""
        };
    });

    const packagesSectionRef = useRef(null);

    const categories = [
        "🏖 Beach",
        "🏔 Mountains",
        "🌆 City",
        "🧭 Adventure",
        "🌿 Nature",
        "✨ Luxury"
    ];

    // --- 2. STATE PERSISTENCE ---
    // Save to sessionStorage automatically whenever any filter state changes
    useEffect(() => {
        sessionStorage.setItem("pkg_category", selectedCategory || "");
        sessionStorage.setItem("pkg_searchInput", searchInput);
        sessionStorage.setItem("pkg_appliedSearch", appliedSearch);
        sessionStorage.setItem("pkg_filters", JSON.stringify(filters));
    }, [selectedCategory, searchInput, appliedSearch, filters]);

    // --- 3. HELPER FUNCTIONS ---
    // Strips emojis and spaces to perfectly match the backend category strings
    const getCategoryText = (catStr) => catStr.replace(/[^a-zA-Z]/g, '').trim();

    const scrollToPackages = () => {
        packagesSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    // --- 4. EVENT HANDLERS ---

    // A. When a Quick Category Pill is clicked
    const handleCategoryClick = (category) => {
        if (selectedCategory === category) {
            // If already selected, toggle it off
            setSelectedCategory(null);
        } else {
            // Select new category and clear other search/dropdown filters
            setSelectedCategory(category);
            setAppliedSearch("");
            setSearchInput("");
            setFilters({ destination: "", budget: "", duration: "", category: "" });
            scrollToPackages();
        }
    };

    // B. When the Search Bar is submitted
    const handleSearchClick = () => {
        if (!searchInput.trim()) return;
        
        // Apply the search term and clear dropdowns/categories
        setAppliedSearch(searchInput);
        setSelectedCategory(null);
        setFilters({ destination: "", budget: "", duration: "", category: "" });
        scrollToPackages();
    };

    // C. When a Dropdown Filter is changed
    const handleFilterChange = (filterName, value) => {
        setFilters((prev) => ({ ...prev, [filterName]: value }));
        
        // Reset Category Buttons and Text Search
        setSelectedCategory(null);
        setAppliedSearch("");
        setSearchInput("");
        scrollToPackages();
    };

    // D. Clear All Filters (Triggered by the new Clear button)
    const clearAllFilters = () => {
        setSelectedCategory(null);
        setAppliedSearch("");
        setSearchInput("");
        setFilters({ destination: "", budget: "", duration: "", category: "" });
    };

    // --- 5. FILTERING LOGIC ---
    const isFilteringActive =
        selectedCategory ||
        appliedSearch ||
        filters.destination ||
        filters.budget ||
        filters.duration ||
        filters.category;

    const filteredPackages = isFilteringActive
        ? packages.filter((pkg) => {
            // Safely cast to string to prevent crashes if data is malformed
            const pkgTitle = String(pkg.title || "").toLowerCase();
            const pkgLocation = String(pkg.location || "").toLowerCase();
            const pkgPrice = Number(pkg.price) || 0;
            const pkgDurationDays = parseInt(String(pkg.duration || "0").match(/\d+/)?.[0] || "0", 10);

            // COMBINED CATEGORY AREA: Merges all possible tags into one string so `.includes()` never misses
            const categorySearchArea = String(
                (pkg.category || "") + " " +
                (pkg.theme || "") + " " +
                (pkg.tags || "") + " " +
                (pkg.type || "")
            ).toLowerCase();

            // 1. Match Quick Categories Pill
            if (selectedCategory) {
                const catText = getCategoryText(selectedCategory).toLowerCase();
                if (!categorySearchArea.includes(catText)) return false;
            }

            // 2. Match Search Bar
            if (appliedSearch) {
                const query = appliedSearch.toLowerCase();
                if (!pkgTitle.includes(query) && !pkgLocation.includes(query)) return false;
            }

            // 3. Match Dropdown Filters
            if (filters.destination && !pkgLocation.includes(filters.destination.toLowerCase())) return false;
            if (filters.category && !categorySearchArea.includes(filters.category.toLowerCase())) return false;

            if (filters.budget) {
                if (filters.budget === "10k-20k" && (pkgPrice < 10000 || pkgPrice > 20000)) return false;
                if (filters.budget === "20k-40k" && (pkgPrice <= 20000 || pkgPrice > 40000)) return false;
                if (filters.budget === "40k+" && pkgPrice <= 40000) return false;
            }

            if (filters.duration) {
                if (filters.duration === "1-3" && (pkgDurationDays < 1 || pkgDurationDays > 3)) return false;
                if (filters.duration === "4-6" && (pkgDurationDays < 4 || pkgDurationDays > 6)) return false;
                if (filters.duration === "7+" && pkgDurationDays < 7) return false;
            }

            return true;
        })
        : [];

    // --- 6. DEFAULT CATEGORIZED ARRAYS ---
    const popularPackages = packages.filter((pkg) => pkg.badge === "Bestseller" || pkg.badge === "Popular" || pkg.badge === "Trending");
    const indiaPackages = packages.filter((pkg) => pkg.category === "India");
    const asiaPackages = packages.filter((pkg) => pkg.continent === "Asia" && pkg.category === "International");
    const worldPackages = packages.filter((pkg) => pkg.continent !== "Asia");

    // --- 7. SKELETON LOADER COMPONENT ---
    const SkeletonLoader = () => (
        <section className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="animate-pulse flex flex-col h-[480px] rounded-[32px] bg-white border border-gray-100 shadow-md overflow-hidden">
                        <div className="w-full h-56 bg-gray-200"></div>
                        <div className="p-7 flex flex-col flex-grow space-y-4">
                            <div className="h-7 bg-gray-200 rounded-md w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded-md w-full mt-4"></div>
                            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                            <div className="mt-auto pt-6">
                                <div className="h-12 bg-gray-200 rounded-2xl w-full"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            {/* Hero Section */}
            <section
                className="relative min-h-[500px] md:h-[650px] bg-cover bg-center"
                style={{ backgroundImage: `url(${images.hero.destinations})` }}
            >
                <div className="absolute inset-0 bg-black/55"></div>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center"
                >
                    <span className="bg-emerald-600 text-white px-5 py-2 rounded-full w-fit font-semibold mb-5 shadow-md">
                        🌍 Explore the World
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl">
                        Discover Your Next Dream Vacation
                    </h1>
                    <p className="text-gray-200 text-lg mt-6 max-w-2xl">
                        Choose from carefully curated holiday packages designed to create unforgettable travel experiences.
                    </p>
                </motion.div>
            </section>

            {/* Sticky Trip Finder Widget (Overlaps Hero) */}
            <div className="sticky top-20 z-40 max-w-6xl mx-auto px-6 -mt-12 md:-mt-16">
                <PackageFilter
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    handleSearchClick={handleSearchClick}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearAllFilters}
                />
            </div>

            {/* Quick Access Categories Pills */}
            <section className="max-w-7xl mx-auto px-6 mt-12 mb-8 flex flex-col items-center">
                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                    {categories.map((item) => (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={item}
                            onClick={() => handleCategoryClick(item)}
                            className={`cursor-pointer rounded-full px-6 py-2.5 font-medium shadow-sm transition-all duration-300 ${
                                selectedCategory === item
                                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md border-transparent"
                                    : "bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                            }`}
                        >
                            {item}
                        </motion.button>
                    ))}
                </div>
            </section>

            {/* Loading / Error States */}
            {loading && <SkeletonLoader />}

            {!loading && error && (
                <section className="max-w-7xl mx-auto px-6 py-16">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center shadow-sm">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-red-700">
                            Unable to Load Packages
                        </h2>
                        <p className="text-gray-600 mt-2">{error}</p>
                        <button
                            onClick={onRetry}
                            className="mt-6 px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 hover:underline font-medium cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                </section>
            )}

            {/* Packages Display Section */}
            {!loading && !error && (
                <section ref={packagesSectionRef} className="max-w-7xl mx-auto px-6 py-10">
                    {isFilteringActive ? (
                        filteredPackages.length > 0 ? (
                            <PackageSection
                                title="Search Results"
                                packages={filteredPackages}
                                onBookNow={onBookNow}
                            />
                        ) : (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🏜️</div>
                                <h3 className="text-2xl font-bold text-gray-700">
                                    No packages found matching your criteria.
                                </h3>
                                <p className="text-gray-500 mt-2">Try adjusting your filters or destination name.</p>
                                <button
                                    onClick={clearAllFilters}
                                    className="mt-6 px-6 py-2 rounded-full bg-emerald-100 text-emerald-700 font-semibold hover:bg-emerald-200 transition cursor-pointer"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )
                    ) : (
                        <>
                            <PackageSection title="🔥 Popular Packages" packages={popularPackages} onBookNow={onBookNow} />
                            <PackageSection title="📍 India" packages={indiaPackages} onBookNow={onBookNow} />
                            <PackageSection title="🌏 Asia" packages={asiaPackages} onBookNow={onBookNow} />
                            <PackageSection title="✈️ World" packages={worldPackages} onBookNow={onBookNow} />
                        </>
                    )}
                </section>
            )}
        </div>
    );
}

export default Packages;
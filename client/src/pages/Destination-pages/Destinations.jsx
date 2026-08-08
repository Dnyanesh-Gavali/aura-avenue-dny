import React, { useState, useRef, useEffect } from 'react';
import { images } from '../../data-destination/imageUrls';
import { destinations } from "../../data-destination/destinations";
import DestinationCard from "../../components/DestinationDetailPageComponents/DestinationCard";
import { useNavigate, useSearchParams } from 'react-router-dom';

const Destinations = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // --- EXPLORE ALL & PAGINATION STATES ---
    // Swapped "All" fallback to "India"
    const selectedContinent = searchParams.get("continent") || "India";
    const currentPage = parseInt(searchParams.get("page")) || 1;
    const [itemsPerPage, setItemsPerPage] = useState(8);
    
    // Backend Paginated States
    const [destList, setDestList] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const gridTopRef = useRef(null);

    // --- SEARCH / AUTOCOMPLETE STATES ---
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState({
        destination: '',
        date: '',
        guests: '1 Guest'
    });

    // --- 1. FETCH PAGINATED DESTINATIONS (10,000+ Optimization) ---
    useEffect(() => {
        const fetchDestinationsPage = async () => {
            setLoading(true);
            try {
                // Calls the optimized backend endpoint
                const res = await fetch(
                    `${import.meta.env.VITE_SERVER_URL}/api/destinations/all?page=${currentPage}&limit=${itemsPerPage}&continent=${encodeURIComponent(selectedContinent)}`
                );
                const data = await res.json();
                if (data.success) {
                    setDestList(data.data);
                    setTotalPages(data.pagination.totalPages);
                }
            } catch (err) {
                console.error("Failed to load paginated destinations:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDestinationsPage();
    }, [currentPage, selectedContinent, itemsPerPage]);

    // --- 2. SEARCH AUTOCOMPLETE LOGIC ---
    useEffect(() => {
        const fetchSuggestions = async () => {
            const term = searchQuery.destination.trim();
            if (term.length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/destinations/autocomplete?q=${term}`);
                if (!res.ok) throw new Error("API network error");
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.warn("Backend API unavailable, falling back to local dataset matching...", err);
                const localFallback = destinations.filter(d =>
                    d.name.toLowerCase().startsWith(term.toLowerCase()) ||
                    d.country.toLowerCase().startsWith(term.toLowerCase())
                ).map(d => ({ name: d.name, country: d.country }));
                setSuggestions(localFallback.slice(0, 6));
            }
        };

        const delayDebounce = setTimeout(() => {
            fetchSuggestions();
        }, 250);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery.destination]);

    // Closes autocomplete popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Set mobile vs desktop cards per page (keeping it visually balanced)
    useEffect(() => {
        if (window.innerWidth < 640) {
            setItemsPerPage(4);
        } else {
            setItemsPerPage(8);
        }
    }, []);

    // --- 3. PAGINATION & TAB HANDLERS ---
    const handleContinentChange = (continent) => {
        setSearchParams({ continent: continent, page: 1 });
    };

    const handlePageChange = (page) => {
        setSearchParams({ continent: selectedContinent, page: page });
        // Auto-scroll logic for smaller devices
        if (window.innerWidth < 640 && gridTopRef.current) {
            const yOffset = -80;
            const y = gridTopRef.current.getBoundingClientRect().top + window.scrollY + yOffset - 100;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.destination.trim()) {
            const searchSlug = searchQuery.destination
                .trim()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/\s+/g, '-');
            navigate(`/destinations/${searchSlug}`);
        }
    };

    // Helper: Smart Windowed Pagination UI
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    // --- 4. POPULAR CARDS (Slider) ---
    // Kept local array mapping for the "Popular Destinations" slider
    const featuredDestinations = destinations.filter((destination) => destination.featured);
    const sliderRef = useRef(null);
    const scrollLeft = () => sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
    const scrollRight = () => sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });

    // Explicit Tab Order (India replaces All, followed by Asia which excludes India via backend)
    const continents = ["India", "Asia", "Europe", "North America", "South America", "Africa", "Oceania"];

    return (
        <>
            {/* --- HERO SECTION --- */}
            <section className='relative h-screen min-h-[600px] w-full bg-cover bg-center bg-no-repeat' style={{ backgroundImage: `url(${images.hero.destinations})` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent" />
                <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl text-left text-white mb-10">
                        <span className="inline-block rounded-full bg-black/50 px-4 py-1.5 text-sm font-semibold tracking-wide uppercase backdrop-blur-sm mb-4">
                            Plan Your Next Escape
                        </span>
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Explore the World's <span className="text-[#3C6300]">Hidden Gems</span>
                        </h1>
                        <br /><br />
                        <div className="inline-block max-w-2xl rounded-full border border-white/10 bg-black/50 px-6 py-3 text-[18px] text-gray backdrop-blur-[4px]">
                            <p className='brightness-150'>
                                Discover breathtaking destinations, curated local experiences, and exclusive travel deals tailored just for you.
                            </p>
                        </div>
                    </div>

                    {/* Search Widget Container */}
                    <div className="w-full max-w-5xl rounded-2xl bg-white p-4 shadow-2xl md:p-6 backdrop-blur-md bg-white/95">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                            <div ref={dropdownRef} className="lg:col-span-3 flex flex-col justify-center border-b pb-2 lg:border-b-0 lg:border-r lg:pr-6 relative">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                    Where to?
                                </label>
                                <input
                                    type="text"
                                    placeholder="Country, city, or resort"
                                    value={searchQuery.destination}
                                    onChange={(e) => {
                                        setSearchQuery({ ...searchQuery, destination: e.target.value });
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    className="w-full bg-transparent py-1 text-lg text-gray-800 placeholder-gray-400 focus:outline-none"
                                    required
                                    autoComplete="off"
                                />
                                {showDropdown && suggestions.length > 0 && (
                                    <ul className="absolute left-0 top-[105%] z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl bg-white p-2 shadow-2xl border border-gray-100 transition-all duration-200">
                                        {suggestions.map((place, idx) => (
                                            <li
                                                key={idx}
                                                onClick={() => {
                                                    setSearchQuery({ ...searchQuery, destination: place.name });
                                                    setShowDropdown(false);
                                                }}
                                                className="cursor-pointer rounded-lg px-4 py-2.5 text-left text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition font-medium flex justify-between items-center"
                                            >
                                                <span className="font-semibold text-gray-800">{place.name}</span>
                                                <span className="text-xs font-semibold uppercase bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md">{place.country}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="lg:col-span-1 flex items-center">
                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-emerald-500 py-4 px-6 font-semibold text-white transition duration-200 hover:bg-emerald-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 lg:h-full text-xl"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* --- POPULAR DESTINATIONS SLIDER --- */}
            <section className="py-16 bg-slate-200 relative overflow-hidden">
                <div className="absolute top-10 left-10 w-64 h-64 bg-gray-500/70 rounded-full mix-blend-multiply filter blur-3xl opacity-90 animate-pulse"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                        <div className="backdrop-blur-xl bg-white/40 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl py-5 px-8 inline-block">
                            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Popular Destinations</h2>
                            <p className="text-slate-600 mt-2 font-medium">Explore our handpicked destinations around the globe.</p>
                        </div>
                        <div className="flex justify-center items-center gap-3">
                            <button
                                onClick={scrollLeft}
                                className="h-12 w-12 rounded-full bg-white shadow hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                            >
                                &#8592;
                            </button>
                            <button
                                onClick={scrollRight}
                                className="h-12 w-12 rounded-full bg-white shadow hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                            >
                                &#8594;
                            </button>
                        </div>
                    </div>
                    <div className="rounded-3xl bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6 shadow-[20px_20px_45px_#d6dae0,-20px_-20px_45px_#ffffff]">
                        <div ref={sliderRef} className="flex gap-8 overflow-x-auto overflow-y-hidden scroll-smooth no-scrollbar pb-3">
                            {featuredDestinations.map((destination) => (
                                <DestinationCard key={destination.id} {...destination} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- EXPLORE ALL (PAGINATED & OPTIMIZED) --- */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-bold">Explore All Destinations</h2>
                        <p className="mt-3 text-gray-500 text-lg">Discover 10,000+ places around the world.</p>
                    </div>

                    {/* Filters - Tab Style */}
                    <div className="border-b border-gray-400 mb-12">
                        <div className="flex overflow-x-auto no-scrollbar gap-8">
                            {continents.map((continent) => (
                                <button
                                    key={continent}
                                    onClick={() => handleContinentChange(continent)}
                                    className={`pb-4 text-lg font-medium whitespace-nowrap transition-colors duration-200 border-b-2 focus:outline-none cursor-pointer ${
                                        selectedContinent === continent
                                            ? "border-emerald-500 text-emerald-600 font-bold"
                                            : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-500 transition-1"
                                    }`}
                                >
                                    {continent}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Destination Grid */}
                    <div ref={gridTopRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 min-h-[400px]">
                        {loading ? (
                            // Render Skeleton Loaders while waiting for the backend API
                            [...Array(itemsPerPage)].map((_, idx) => (
                                <div key={idx} className="h-[380px] w-full rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
                            ))
                        ) : destList.length > 0 ? (
                            // Render actual Data 
                            destList.map((destination) => (
                                <DestinationCard
                                    key={destination.id}
                                    {...destination}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-400 font-semibold text-xl">
                                No destinations found in this region.
                            </div>
                        )}
                    </div>

                    {/* Smart Windowed Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
                            <button
                                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
                            >
                                Prev
                            </button>
                            
                            {getPageNumbers().map((num, index) => 
                                num === "..." ? (
                                    <span key={index} className="px-3 py-2 text-gray-400 font-bold">...</span>
                                ) : (
                                    <button
                                        key={index}
                                        onClick={() => handlePageChange(num)}
                                        className={`w-10 h-10 rounded-lg font-medium transition-colors cursor-pointer ${
                                            currentPage === num
                                                ? "bg-emerald-500 text-white shadow-md border-transparent font-bold"
                                                : "border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                                        }`}
                                    >
                                        {num}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default Destinations;
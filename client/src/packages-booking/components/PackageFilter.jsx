import React from 'react';

function PackageFilter({
    searchInput,
    setSearchInput,
    handleSearchClick,
    filters,
    onFilterChange,
    onClearFilters
}) {
    return (
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-4 w-full transition-all">
            <div className="flex flex-col lg:flex-row gap-3">
                {/* Text Search Input */}
                <div className="flex-[2]">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                        placeholder="Search destinations (e.g. Goa, Bali, Kashmir)"
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400 h-full"
                    />
                </div>

                {/* Destination Filter */}
                <div className="flex-1">
                    <select
                        value={filters.destination}
                        onChange={(e) => onFilterChange("destination", e.target.value)}
                        className="w-full h-full border border-gray-200 bg-gray-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-700 cursor-pointer"
                    >
                        <option value="">Any Destination</option>
                        <option value="Goa">Goa</option>
                        <option value="Kashmir">Kashmir</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Bali">Bali</option>
                    </select>
                </div>

                {/* Budget Filter */}
                <div className="flex-1">
                    <select
                        value={filters.budget}
                        onChange={(e) => onFilterChange("budget", e.target.value)}
                        className="w-full h-full border border-gray-200 bg-gray-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-700 cursor-pointer"
                    >
                        <option value="">Any Budget</option>
                        <option value="10k-20k">₹ 10,000 - ₹ 20,000</option>
                        <option value="20k-40k">₹ 20,000 - ₹ 40,000</option>
                        <option value="40k+">₹ 40,000+</option>
                    </select>
                </div>

                {/* Duration Filter */}
                <div className="flex-1">
                    <select
                        value={filters.duration}
                        onChange={(e) => onFilterChange("duration", e.target.value)}
                        className="w-full h-full border border-gray-200 bg-gray-50 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-700 cursor-pointer"
                    >
                        <option value="">Any Duration</option>
                        <option value="1-3">1-3 Days</option>
                        <option value="4-6">4-6 Days</option>
                        <option value="7+">7+ Days</option>
                    </select>
                </div>

                {/* Search Button */}
                {/* 2. Replace the single Search button area with a flex container holding both Search and Clear */}
                <div className="flex gap-2 flex-1">
                    <button
                        onClick={handleSearchClick}
                        className="flex-[2] bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg text-white px-4 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95"
                    >
                        Search
                    </button>
                    <button
                        onClick={onClearFilters}
                        className="flex-1 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 border border-gray-200 hover:border-red-200 px-4 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95"
                        title="Clear all filters"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PackageFilter;
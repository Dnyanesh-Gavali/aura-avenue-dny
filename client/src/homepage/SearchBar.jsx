import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon, AlertIcon, PinIcon } from "./icons";

// Handbook requirement: "Search and Filter — search by city or country,
// and filter by type (beach, mountains, heritage, adventure) or budget range."
const TRIP_TYPES = ["Beach", "Mountains", "Heritage", "Adventure"];
const BUDGET_OPTIONS = [
  { id: "economy", label: "Economy" },
  { id: "moderate", label: "Moderate" },
  { id: "luxury", label: "Luxury" },
];

// Live location lookup — no predefined list. Open-Meteo's Geocoding API is
// free, needs no API key, and explicitly supports CORS for direct browser
// calls: https://open-meteo.com/en/docs/geocoding-api
const GEOCODE_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

function formatLocation(result) {
  const parts = [result.name];
  if (result.admin1 && result.admin1 !== result.name) parts.push(result.admin1);
  if (result.country) parts.push(result.country);
  return parts.join(", ");
}

export default function SearchBar() {
  const navigate = useNavigate();
  const [destinationQuery, setDestinationQuery] = useState("");
  const [activeType, setActiveType] = useState(null);
  const [activeBudget, setActiveBudget] = useState(null);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [matches, setMatches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Debounced live lookup — fires ~300ms after typing stops, and cancels
  // any in-flight request if the query changes again before it resolves.
  useEffect(() => {
    const trimmed = destinationQuery.trim();

    if (trimmed.length < 2) {
      setMatches([]);
      setSearchError("");
      setIsSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");
      try {
        const url = `${GEOCODE_ENDPOINT}?name=${encodeURIComponent(trimmed)}&count=6&language=en&format=json`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        const data = await res.json();
        setMatches((data.results || []).map(formatLocation));
      } catch (err) {
        if (err.name !== "AbortError") {
          setSearchError("Couldn't load suggestions — check your connection.");
          setMatches([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [destinationQuery]);

  const toggleType = (type) => {
    setActiveType((current) => (current === type ? null : type));
    if (error) setError("");
  };

  const toggleBudget = (id) => {
    setActiveBudget((current) => (current === id ? null : id));
    if (error) setError("");
  };

  const selectLocation = (loc) => {
    setDestinationQuery(loc);
    setShowSuggestions(false);
    setActiveIndex(-1);
    if (error) setError("");
  };

  const handleInputChange = (e) => {
    setDestinationQuery(e.target.value);
    setShowSuggestions(true);
    setActiveIndex(-1);
    if (error) setError("");
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || matches.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? matches.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectLocation(matches[activeIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);

    const trimmedQuery = destinationQuery.trim();

    // Form validation per handbook: don't let users submit empty/invalid
    // searches — require at least a destination, a trip type, or a budget.
    if (!trimmedQuery && !activeType && !activeBudget) {
      setError("Enter a destination, or pick a trip type or budget, to search.");
      return;
    }

    setError("");

    // UI only — this project has no backend/search API yet, so we just
    // route to the Destinations page with the query as URL params. Once
    // that page exists and reads these params, results will show there.
    const params = new URLSearchParams();
    if (trimmedQuery) params.set("query", trimmedQuery);
    if (activeType) params.set("type", activeType.toLowerCase());
    if (activeBudget) params.set("budget", activeBudget);
    navigate(`/destinations?${params.toString()}`);
  };

  const dropdownOpen = showSuggestions && destinationQuery.trim().length >= 2;

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={handleSearchSubmit}
        noValidate
        className="flex w-full flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl shadow-black/10 sm:flex-row sm:items-center sm:gap-0"
      >
        <div className="relative flex-1 px-3 py-1.5 sm:border-r sm:border-[#E5E7E0]">
          <label htmlFor="hero-search" className="block text-xs font-semibold uppercase tracking-wide text-[#8A9089]">
            Where to?
          </label>
          <div className="mt-1 flex items-center gap-2">
            <SearchIcon className="h-4 w-4 text-[#8A9089] sm:hidden" />
            <input
              id="hero-search"
              type="text"
              autoComplete="off"
              value={destinationQuery}
              onChange={handleInputChange}
              onFocus={() => {
                if (destinationQuery.trim().length >= 2) setShowSuggestions(true);
              }}
              onBlur={() => {
                // Small delay so a suggestion's onMouseDown can still fire.
                window.setTimeout(() => setShowSuggestions(false), 100);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Country, city, or resort"
              role="combobox"
              aria-expanded={dropdownOpen}
              aria-autocomplete="list"
              aria-controls="destination-suggestions"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "hero-search-error" : undefined}
              className="w-full rounded-md border-none bg-transparent text-sm text-[#14201A] placeholder:text-[#A8ADA5] focus:outline-none"
            />
            {isSearching && (
              <svg className="h-4 w-4 flex-shrink-0 animate-spin text-[#8A9089]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )}
          </div>

          {dropdownOpen && (
            <ul
              id="destination-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-auto rounded-xl border border-[#E5E7E0] bg-white py-1.5 shadow-xl shadow-black/10"
            >
              {isSearching && matches.length === 0 && (
                <li className="px-3.5 py-2.5 text-sm text-[#8A9089]">Searching…</li>
              )}

              {!isSearching && searchError && (
                <li className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm text-[#D14343]">
                  <AlertIcon className="h-3.5 w-3.5 flex-shrink-0" />
                  {searchError}
                </li>
              )}

              {!isSearching && !searchError && matches.length === 0 && (
                <li className="px-3.5 py-2.5 text-sm text-[#8A9089]">No matching destinations.</li>
              )}

              {matches.map((loc, i) => (
                <li key={loc}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectLocation(loc);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:bg-[#F5F4EF] ${
                      i === activeIndex ? "bg-[#1EA35B]/10 text-[#167A44]" : "text-[#14201A] hover:bg-[#F5F4EF]"
                    }`}
                  >
                    <PinIcon className="h-3.5 w-3.5 flex-shrink-0 text-[#8A9089]" />
                    {loc}
                  </button>
                </li>
              ))}

              {matches.length > 0 && (
                <li className="mt-1 border-t border-[#E5E7E0] px-3.5 pt-1.5 text-[10px] text-[#A8ADA5]">
                  Location search by Open-Meteo
                </li>
              )}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="rounded-xl bg-[#167A44] px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#125E36] hover:shadow-[0_10px_24px_-6px_rgba(22,122,68,0.55)] active:translate-y-0 active:shadow-[0_4px_10px_-4px_rgba(22,122,68,0.45)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#167A44]"
        >
          Search
        </button>
      </form>

      {error && (
        <p
          id="hero-search-error"
          role="alert"
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#14201A]/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
        >
          <AlertIcon className="h-3.5 w-3.5 flex-shrink-0 text-[#FCA5A5]" />
          {error}
        </p>
      )}

      <div className="mt-4">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">Trip type</p>
        <div className="flex flex-wrap gap-2">
          {TRIP_TYPES.map((type) => {
            const isActive = activeType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                aria-pressed={isActive}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#14201A] ${
                  isActive
                    ? "border-[#167A44] bg-[#167A44] text-white"
                    : "border-white/50 bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">Budget</p>
        <div className="flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((budget) => {
            const isActive = activeBudget === budget.id;
            return (
              <button
                key={budget.id}
                type="button"
                onClick={() => toggleBudget(budget.id)}
                aria-pressed={isActive}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#14201A] ${
                  isActive
                    ? "border-[#167A44] bg-[#167A44] text-white"
                    : "border-white/50 bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {budget.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
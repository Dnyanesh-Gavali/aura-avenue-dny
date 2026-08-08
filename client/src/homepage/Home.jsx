import { Component, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../homepage/Navbar";
import Footer from "../homepage/Footer";
import {
    PinIcon,
    StarIcon,
    ArrowIcon,
    CheckIcon,
    CalendarIcon,
    HeartIcon,
} from "../homepage/Icons";


class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("AuraAvenue UI error:", error, info);
    }

    handleReload = () => {
        this.setState({ hasError: false });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
                    <p className="text-lg font-bold text-[#14201A]">Something went wrong.</p>
                    <p className="max-w-sm text-sm text-[#6B7167]">
                        We hit a snag loading this page. Try refreshing — if it keeps happening, let us know.
                    </p>
                    <button
                        type="button"
                        onClick={this.handleReload}
                        className="rounded-full bg-[#167A44] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#125E36]"
                    >
                        Reload page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}


function SmartImage({ src, alt, className = "", fallbackLabel, priority = false }) {
    const [errored, setErrored] = useState(false);

    if (errored) {
        return (
            <div
                className={`flex items-center justify-center bg-gradient-to-br from-[#1EA35B]/15 to-[#0E6E68]/25 text-center ${className}`}
                role="img"
                aria-label={alt}
            >
                <span className="px-4 text-xs font-semibold text-[#167A44]">
                    {fallbackLabel || alt || "Image unavailable"}
                </span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            onError={() => setErrored(true)}
            className={className}
        />
    );
}

// WMO weather codes → a simple emoji, so the badge doesn't need an icon set.
// Reference: https://open-meteo.com/en/docs (see "WMO Weather interpretation codes")

function weatherEmoji(code) {
    if (code === 0) return "☀️";
    if (code === 1 || code === 2) return "🌤️";
    if (code === 3) return "☁️";
    if (code === 45 || code === 48) return "🌫️";
    if (code >= 51 && code <= 57) return "🌦️";
    if (code >= 61 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "🌨️";
    if (code >= 80 && code <= 82) return "🌧️";
    if (code >= 85 && code <= 86) return "🌨️";
    if (code >= 95) return "⛈️";
    return "🌡️";
}

/*
 * useEffect in Home() below for the actual fetch.
 */
function WeatherBadge({ entry }) {
    if (!entry || entry.status === "loading") {
        return (
            <span
                aria-hidden="true"
                className="absolute right-3 top-3 h-6 w-16 animate-pulse rounded-full bg-white/70 backdrop-blur"
            />
        );
    }
    if (entry.status === "error") return null;
    return (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#14201A] shadow-sm backdrop-blur">
            <span aria-hidden="true">{weatherEmoji(entry.code)}</span>
            {entry.temp}°C
        </span>
    );
}

/** Pulsing placeholder shown while the (simulated) listings "load". */
function DestinationCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-[#E5E7E0] bg-white" aria-hidden="true">
            <div className="h-44 w-full animate-pulse bg-[#E5E7E0]" />
            <div className="space-y-2.5 p-5">
                <div className="h-3 w-1/3 animate-pulse rounded bg-[#E5E7E0]" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-[#E5E7E0]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-[#E5E7E0]" />
            </div>
        </div>
    );
}

function PackageCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E7E0] bg-white sm:flex-row" aria-hidden="true">
            <div className="h-40 w-full flex-shrink-0 animate-pulse bg-[#E5E7E0] sm:h-auto sm:w-44" />
            <div className="flex-1 space-y-2.5 p-5">
                <div className="h-4 w-1/4 animate-pulse rounded-full bg-[#E5E7E0]" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#E5E7E0]" />
                <div className="h-3 w-full animate-pulse rounded bg-[#E5E7E0]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[#E5E7E0]" />
            </div>
        </div>
    );
}

// Rotating color palette for news category badges — picked deterministically
// from the category text so real, varied categories from the live feed
// still get consistent, readable colors without hardcoding one per item.
const NEWS_TAG_PALETTES = [
    { tagClass: "bg-[#1EA35B]/10 text-[#167A44]", dotClass: "bg-[#167A44]" },
    { tagClass: "bg-[#FEF3E2] text-[#B4690E]", dotClass: "bg-[#F2A93B]" },
    { tagClass: "bg-[#E8F0FE] text-[#1D4ED8]", dotClass: "bg-[#3B82F6]" },
    { tagClass: "bg-[#E0F7F4] text-[#0E6E68]", dotClass: "bg-[#0E6E68]" },
    { tagClass: "bg-[#EAF6FA] text-[#1E5FA8]", dotClass: "bg-[#1E5FA8]" },
];

function getNewsPalette(category = "") {
    let hash = 0;
    for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
    return NEWS_TAG_PALETTES[hash % NEWS_TAG_PALETTES.length];
}

// Currents gives dates like "2024-05-01 12:34:56 +0000" — space-separated,
// no "T". That shape parses inconsistently across engines, so normalize
// to ISO first. Used for both the "3h ago" labels and, importantly, for
// sorting news by actual recency.
function parseNewsDate(dateString) {
    if (!dateString) return 0;
    const iso = dateString.includes("T")
        ? dateString
        : dateString.trim().replace(" ", "T").replace(/\+00:?00$/, "Z");
    const t = new Date(iso).getTime();
    return Number.isNaN(t) ? 0 : t;
}

function timeAgo(dateString) {
    const then = parseNewsDate(dateString);
    if (!then) return "";
    const minutes = Math.floor((Date.now() - then) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
}

// Real article from the live news feed — opens the actual source article
// (not an internal page), so we're never showing a headline that doesn't
// lead somewhere real.
function NewsItem({ item }) {
    const palette = getNewsPalette(item.category);
    return (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-2xl border border-[#E5E7E0] bg-white p-5 transition-shadow hover:shadow-md"
        >
            <span className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${palette.dotClass}`} aria-hidden="true" />
            <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${palette.tagClass}`}>
                        {item.category}
                    </span>
                    <span className="text-xs text-[#8A9089]">{timeAgo(item.publishedAt)}</span>
                    {item.source && <span className="text-xs text-[#8A9089]">· {item.source}</span>}
                </div>
                <h3 className="mt-2 text-base font-bold text-[#14201A] transition-colors duration-300 motion-reduce:transition-none group-hover:text-[#167A44]">
                    {item.headline}
                </h3>
                {item.blurb && <p className="mt-1 text-sm text-[#6B7167]">{item.blurb}</p>}
            </div>
            <ArrowIcon className="mt-1.5 h-4 w-4 flex-shrink-0 text-[#8A9089] transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:translate-x-1 group-hover:text-[#167A44]" />
        </a>
    );
}

function NewsItemSkeleton() {
    return (
        <div className="flex items-start gap-4 rounded-2xl border border-[#E5E7E0] bg-white p-5" aria-hidden="true">
            <span className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full bg-[#E5E7E0]" />
            <div className="flex-1 space-y-2.5">
                <div className="h-3 w-24 animate-pulse rounded-full bg-[#E5E7E0]" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#E5E7E0]" />
                <div className="h-3 w-full animate-pulse rounded bg-[#E5E7E0]" />
            </div>
        </div>
    );
}

function RefreshIcon({ className = "h-4 w-4" }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path
                d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}


const SAVED_KEY = "auraavenue:savedDestinations";

function getInitialSaved() {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(SAVED_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}



function DestinationCard({ dest, weatherEntry, isSaved, onToggleSave, compact = false }) {
    // 1. Add state to allow the image to change after the initial load
    const [cardImage, setCardImage] = useState(dest.image);

    // 2. Make the card "smart" by fetching real images on the fly
    useEffect(() => {
        // Check if the provided image is missing or is our generic Pexels fallback
        const isPlaceholder = !dest.image || dest.image === "needs-fetch" || (typeof dest.image === 'string' && dest.image.includes('pexels-photo-3225517'));

        if (isPlaceholder) {
            const fetchRealImage = async () => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/destinations/card-info?name=${encodeURIComponent(dest.name)}`);
                    const apiData = await res.json();

                    if (apiData.success && apiData.image) {
                        let finalImageUrl = apiData.image;
                        
                        // Compress Unsplash URLs on the fly
                        if (finalImageUrl.includes('unsplash.com')) {
                            const baseUrl = finalImageUrl.split('?')[0].split('&')[0];
                            finalImageUrl = `${baseUrl}?w=600&h=400&fit=crop&q=70&auto=format`;
                        } 
                        // Compress Pexels URLs (excluding the fallback itself)
                        else if (finalImageUrl.includes('pexels.com') && !finalImageUrl.includes('3225517')) {
                            const baseUrl = finalImageUrl.split('?')[0];
                            finalImageUrl = `${baseUrl}?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop`;
                        }
                        
                        setCardImage(finalImageUrl);
                    }
                } catch (error) {
                    console.error("Failed to fetch real image for:", dest.name);
                }
            };
            fetchRealImage();
        }
    }, [dest.name, dest.image]); // Note: Depends on props to prevent infinite loops

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border border-[#E5E7E0] bg-white transition-shadow hover:shadow-lg ${compact ? "w-72 flex-shrink-0 snap-start" : "w-full"
                }`}
        >
            <Link to={`/destinations/${dest.slug}`} className="block">
                <div className="relative h-44 w-full overflow-hidden">
                    <SmartImage
                        src={cardImage} /* <-- UPDATED to use our new state variable */
                        alt={`${dest.name}, ${dest.country}`}
                        fallbackLabel={dest.name}
                        className="h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
                    />
                    <WeatherBadge entry={weatherEntry} />
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7167]">
                            <PinIcon className="h-3.5 w-3.5" />
                            {dest.country}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-[#14201A]">
                            <StarIcon className="h-3.5 w-3.5 text-[#F2A93B] transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:rotate-12 group-hover:scale-110" />
                            {dest.rating}
                        </div>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-[#14201A] transition-colors duration-300 motion-reduce:transition-none group-hover:text-[#167A44]">
                        {dest.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#6B7167]">
                        From <span className="font-semibold text-[#14201A]">{formatINR(dest.price)}</span> / person
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[#8A9089]">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        Best time to visit: {dest.bestTime}
                    </div>
                </div>
            </Link>
            <button
                type="button"
                onClick={() => onToggleSave(dest.slug)}
                aria-pressed={isSaved}
                aria-label={isSaved ? `Remove ${dest.name} from saved destinations` : `Save ${dest.name}`}
                className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#167A44] focus-visible:ring-offset-1"
            >
                <HeartIcon filled={isSaved} className={`h-4 w-4 ${isSaved ? "text-[#E11D48]" : "text-[#3B443E]"}`} />
            </button>
        </div>
    );
}

/* ---------------------------------------------------------- */
/*  Data                                                       */
/* ---------------------------------------------------------- */
/*  Images are hotlinked from Unsplash (free to use under the  */
/*  Unsplash License, no attribution required). Swap these for */
/*  your own destination photos whenever you're ready — just   */
/*  replace the `image` value with your own file/URL.          */

const TRUST_POINTS = [
    { title: "Best Price Guarantee", desc: "Find it cheaper, we'll match it" },
    { title: "24/7 Travel Support", desc: "Real humans, day or night" },
    { title: "Handpicked Stays", desc: "Every property vetted by our team" },
    { title: "50,000+ Happy Travelers", desc: "And counting, every year" },
];


const DESTINATIONS = [
    {
        slug: "santorini",
        latitude: 36.3932,
        longitude: 25.4615,
        name: "Santorini",
        country: "Greece",
        tags: ["beach", "heritage"],
        rating: 4.9,
        price: 899,
        bestTime: "Apr – Oct",
        image:
            "https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=800&q=80",
    },
    {
        slug: "bali",
        latitude: -8.6705,
        longitude: 115.2126,
        name: "Bali",
        country: "Indonesia",
        tags: ["beach", "adventure"],
        rating: 4.8,
        price: 649,
        bestTime: "May – Sep",
        image:
            "https://images.unsplash.com/photo-1557093793-d149a38a1be8?auto=format&fit=crop&w=800&q=80",
    },
    {
        slug: "kyoto",
        latitude: 35.0116,
        longitude: 135.7681,
        name: "Kyoto",
        country: "Japan",
        tags: ["heritage", "culture"],
        rating: 4.9,
        price: 1120,
        bestTime: "Mar – May",
        image:
            "https://images.unsplash.com/photo-1753517457294-2bf4694e3760?auto=format&fit=crop&w=800&q=80",
    },
    {
        slug: "machu-picchu",
        latitude: -13.1631,
        longitude: -72.545,
        name: "Machu Picchu",
        country: "Peru",
        tags: ["adventure", "heritage"],
        rating: 4.9,
        price: 990,
        bestTime: "May – Sep",
        image:
            "https://images.unsplash.com/photo-1568805746970-0bbae56ab18b?auto=format&fit=crop&w=800&q=80",
    },
    {
        slug: "swiss-alps",
        latitude: 46.0207,
        longitude: 7.7491,
        name: "Swiss Alps",
        country: "Switzerland",
        tags: ["mountains", "adventure"],
        rating: 4.7,
        price: 1340,
        bestTime: "Jun – Sep",
        image:
            "https://images.unsplash.com/photo-1531743579253-fa8d52993ba5?auto=format&fit=crop&w=800&q=80",
    },
    {
        slug: "marrakech",
        latitude: 31.6295,
        longitude: -7.9811,
        name: "Marrakech",
        country: "Morocco",
        tags: ["heritage", "culture"],
        rating: 4.6,
        price: 720,
        bestTime: "Mar – May",
        image:
            "https://images.unsplash.com/photo-1653323792487-6ecc6217040b?auto=format&fit=crop&w=800&q=80",
    },
];

const PACKAGES = [
    {
        slug: "maldives-overwater-escape",
        name: "Maldives Overwater Escape",
        tag: "Honeymoon Pick",
        days: 6,
        nights: 5,
        price: 1899,
        blurb:
            "A private overwater villa, a sunset dolphin cruise, and dinner on a sandbank that disappears at high tide.",
        image:
            "https://images.unsplash.com/photo-1470214203634-e436a8848e23?auto=format&fit=crop&w=800&q=80",
    },
    {
        slug: "grecian-island-hopper",
        name: "Grecian Island Hopper",
        tag: "Best Seller",
        days: 8,
        nights: 7,
        price: 2150,
        blurb:
            "Caldera sunsets in Santorini, then the whitewashed lanes and beach clubs of Mykonos.",
        image:
            "https://images.unsplash.com/photo-1678188453562-a4dcc0560b46?auto=format&fit=crop&w=800&q=80",
    },
    {
        slug: "peru-andes-trek",
        name: "Peru Andes Trek",
        tag: "Adventure",
        days: 7,
        nights: 6,
        price: 1650,
        blurb:
            "Sacred Valley villages, two days on the Inca Trail, and sunrise over Machu Picchu.",
        image:
            "https://images.unsplash.com/photo-1568805746970-0bbae56ab18b?auto=format&fit=crop&w=800&q=80",
    },
    {
        slug: "japan-cultural-trail",
        name: "Japan Cultural Trail",
        tag: "Culture",
        days: 9,
        nights: 8,
        price: 2400,
        blurb:
            "Tokyo's neon crossings, Kyoto's temple gardens, and Osaka's late-night street food.",
        image:
            "https://images.unsplash.com/photo-1753517457294-2bf4694e3760?auto=format&fit=crop&w=800&q=80",
    },
];

// Live weather per destination — free, no API key, CORS-enabled:
// https://open-meteo.com/en/docs
const WEATHER_ENDPOINT = "https://api.open-meteo.com/v1/forecast";


const USD_TO_INR = 95.5;

function formatINR(usd) {
    const inr = Math.round((usd * USD_TO_INR) / 100) * 100;
    return `₹${inr.toLocaleString("en-IN")}`;
}

/* ---------------------------------------------------------- */
/*  Page                                                        */
/* ---------------------------------------------------------- */

// Large, rotating pool of travel & tourism search phrases used to build
// the Currents API query. Currents has no dedicated "travel" category —
// a plain "travel" keyword match matched time-travel movie news, "space
// travel" science pieces, unrelated "business travel" HR pieces, etc.
// So precision comes from a boolean query against genuinely tourism-
// shaped phrases instead. There are 150 of them here, spanning trip
// styles, transport, lodging, planning/documents, destinations, the
// tourism industry itself, and traveler concerns. fetchNews samples a
// random subset on every single call (see NEWS_CATEGORY_TERMS_PER_QUERY
// below), so different sub-topics of travel surface on each refresh
// instead of the same handful of "tourism OR vacation" stories forever.
const TRAVEL_CATEGORY_TERMS = [
    "tourism", "vacation", "travel destination", "backpacking",
    "road trip", "solo travel", "family travel", "luxury travel",
    "budget travel", "adventure travel", "eco tourism", "sustainable tourism",
    "slow travel", "honeymoon travel", "group tour", "staycation",
    "day trip", "weekend getaway", "gap year travel", "digital nomad",
    "wellness retreat", "medical tourism", "culinary tourism", "food tourism",
    "wine tourism", "cultural tourism", "heritage tourism", "religious pilgrimage",
    "dark tourism", "voluntourism", "space tourism", "flight route",
    "airline", "airport", "budget airline", "low cost carrier",
    "cruise ship", "cruise line", "train travel", "rail pass",
    "high speed rail", "ferry route", "rental car", "campervan",
    "motorhome", "bike touring", "cycling holiday", "sailing trip",
    "river cruise", "hotel booking", "resort", "boutique hotel",
    "hostel", "vacation rental", "all inclusive resort", "glamping",
    "campsite", "bed and breakfast", "eco lodge", "homestay",
    "timeshare", "short term rental", "travel advisory", "tourist visa",
    "travel guide", "travel itinerary", "passport rules", "travel insurance",
    "visa free travel", "e-visa", "immigration policy travel", "border reopening",
    "travel restrictions", "travel ban", "customs regulations", "duty free shopping",
    "airport security", "national park", "island getaway", "beach destination",
    "mountain resort", "safari tour", "desert tourism", "ski resort",
    "hiking trail tourism", "world heritage site", "tourist attraction", "theme park",
    "amusement park", "cruise destination", "coastal tourism", "wildlife tourism",
    "eco tourism destination", "volcano tourism", "polar expedition", "diving destination",
    "snorkeling trip", "wildlife safari", "tourism industry", "hospitality industry",
    "tourism board", "travel startup", "airline industry news", "hotel industry news",
    "tourism revenue", "overtourism", "tourism recovery", "travel demand",
    "airfare prices", "hotel prices", "summer travel", "winter travel",
    "holiday travel", "festival tourism", "peak travel season", "travel trends",
    "jet lag", "travel scam", "flight delay", "lost luggage",
    "travel deal", "flight sale", "cheap flights", "travel booking app",
    "tour operator", "travel agency", "expedition cruise", "backpackers hostel",
    "road trip route", "scenic drive", "national tourism campaign", "UNESCO heritage site",
    "tourist arrivals", "cross border travel", "domestic tourism", "international tourism",
    "rural tourism", "agritourism", "city break", "weekend trip",
    "luxury cruise", "adventure tourism", "extreme tourism", "volunteer tourism",
    "responsible travel", "pet friendly travel", "accessible travel", "senior travel",
    "solo female travel", "romantic getaway",
];

export default function Home() {
    const [weather, setWeather] = useState({});
    const [contentReady, setContentReady] = useState(false);
    const [savedSlugs, setSavedSlugs] = useState(getInitialSaved);
    const [newsArticles, setNewsArticles] = useState([]);
    const [isLoadingNews, setIsLoadingNews] = useState(true);
    const [isRefreshingNews, setIsRefreshingNews] = useState(false);
    const [newsError, setNewsError] = useState("");
    const newsRequestIdRef = useRef(0);
    // Every article fetched this session (id -> article), kept around so
    // a refresh always has the full freshest-known set to pick from, not
    // just whatever one API call happened to return. See fetchNews below.
    const newsKnownRef = useRef(new Map());
    // Ids of articles already shown this session, so a refresh actually
    // feels new instead of possibly repeating a headline.
    const newsShownIdsRef = useRef(new Set());
    const recommendedScrollerRef = useRef(null);
    const heroScrollerRef = useRef(null);
    const [activeShowcase, setActiveShowcase] = useState(0);

    // Live travel news via Currents API (currentsapi.services) — free,
    // 1,000 requests/day, no credit card. The initial page load can use a
    // short localStorage cache for speed, but every explicit "Refresh news"
    // click always makes a real network call for page 1 with a freshly
    // randomized set of category terms (see TRAVEL_CATEGORY_TERMS above).
    //
    // Why: the previous approach fetched one batch of articles and then
    // served it out a slice at a time on each refresh. Since the API
    // returns results newest-first, article #9 in that batch is always
    // older than article #1, #17 always older than #9, and so on — so
    // "Refresh news" was guaranteed to walk backwards in time, batch by
    // batch, no matter how big the batch was. The fix is to never slice
    // through a stale, already-fetched list: always ask the API for
    // what's newest *right now*, sort by publishedAt to be sure, and
    // prefer whatever we haven't shown yet.
    const NEWS_DISPLAY_SIZE = 8;
    const NEWS_FETCH_SIZE = 20;
    const NEWS_CATEGORY_TERMS_PER_QUERY = 10;
    const NEWS_KNOWN_CAP = 300;
    const NEWS_CACHE_KEY = "auraavenue:newsCache";
    const NEWS_CACHE_TTL_MS = 10 * 60 * 1000;

    function pickRandomTerms(pool, count) {
        const copy = [...pool];
        const picked = [];
        for (let i = 0; i < count && copy.length > 0; i++) {
            const idx = Math.floor(Math.random() * copy.length);
            picked.push(copy.splice(idx, 1)[0]);
        }
        return picked;
    }

    // Adds freshly fetched articles into the session-long known pool
    // (newest wins if we somehow refetch the same id), then trims it
    // down to the freshest NEWS_KNOWN_CAP so it never grows unbounded.
    function mergeIntoKnown(articles) {
        const map = newsKnownRef.current;
        articles.forEach((a) => map.set(a.id, a));
        if (map.size > NEWS_KNOWN_CAP) {
            const freshest = [...map.values()]
                .sort((a, b) => parseNewsDate(b.publishedAt) - parseNewsDate(a.publishedAt))
                .slice(0, NEWS_KNOWN_CAP);
            map.clear();
            freshest.forEach((a) => map.set(a.id, a));
        }
    }

    // The actual batch shown to the user: the freshest articles in the
    // whole known pool, preferring ones we haven't shown yet. Recomputed
    // from the full pool every time — never from just the latest API
    // response — so it can't regress to something older than before.
    function computeDisplayBatch() {
        const all = [...newsKnownRef.current.values()].sort(
            (a, b) => parseNewsDate(b.publishedAt) - parseNewsDate(a.publishedAt)
        );
        const unseen = all.filter((a) => !newsShownIdsRef.current.has(a.id));
        const seenButFresh = all.filter((a) => newsShownIdsRef.current.has(a.id));
        return [...unseen, ...seenButFresh].slice(0, NEWS_DISPLAY_SIZE);
    }

    async function fetchNews({ isInitial = false, useCache = false } = {}) {
        // Guards against a stale response landing after a newer request was
        // already kicked off (e.g. double-clicking refresh) — only the most
        // recent request is allowed to update state.
        const requestId = ++newsRequestIdRef.current;
        const isCurrent = () => newsRequestIdRef.current === requestId;

        if (isInitial) {
            setIsLoadingNews(true);
        } else {
            setIsRefreshingNews(true);
        }
        setNewsError("");

        if (useCache) {
            try {
                const cached = JSON.parse(window.localStorage.getItem(NEWS_CACHE_KEY) || "null");
                if (cached && Date.now() - cached.fetchedAt < NEWS_CACHE_TTL_MS) {
                    if (isCurrent()) {
                        mergeIntoKnown(cached.articles || []);
                        const batch = computeDisplayBatch();
                        setNewsArticles(batch);
                        batch.forEach((a) => newsShownIdsRef.current.add(a.id));
                        setIsLoadingNews(false);
                        setIsRefreshingNews(false);
                    }
                    return;
                }
            } catch {
                // Corrupt or unreadable cache entry — fall through and fetch fresh.
            }
        }

        const apiKey = import.meta.env.VITE_CURRENTS_API_KEY;
        if (!apiKey) {
            if (isCurrent()) {
                setNewsError("Live news isn't configured yet — add VITE_CURRENTS_API_KEY to your .env file.");
                setIsLoadingNews(false);
                setIsRefreshingNews(false);
            }
            return;
        }

        try {
            // Currents' v2/search endpoint supports boolean queries (AND / OR /
            // NOT / quotes / parentheses). Sampling a random subset of
            // TRAVEL_CATEGORY_TERMS on every call means each refresh searches
            // a different slice of travel/tourism sub-topics — destinations
            // one time, airlines or visas the next — instead of hammering the
            // API with the same fixed query and getting back the same handful
            // of stories.
            const terms = pickRandomTerms(TRAVEL_CATEGORY_TERMS, NEWS_CATEGORY_TERMS_PER_QUERY);
            const query =
                `(${terms.map((t) => `"${t}"`).join(" OR ")}) ` +
                'AND NOT ("time travel" OR "space travel")';
            const url =
                `https://api.currentsapi.services/v2/search?query=${encodeURIComponent(query)}` +
                `&language=en&page_size=${NEWS_FETCH_SIZE}&page_number=1&apiKey=${encodeURIComponent(apiKey)}`;
            const res = await fetch(url);

            if (!res.ok) {
                const message =
                    res.status === 401 || res.status === 403
                        ? "The news provider rejected our API key."
                        : res.status === 429
                            ? "The news provider's rate limit was hit — try again shortly."
                            : `The news provider returned an error (${res.status}).`;
                throw new Error(message);
            }

            const data = await res.json();
            const dedupeIds = new Set();
            const articles = (data.news || [])
                .filter((item) => {
                    if (!item.id || dedupeIds.has(item.id)) return false;
                    dedupeIds.add(item.id);
                    return true;
                })
                .map((item) => {
                    let source = "";
                    try {
                        source = new URL(item.url).hostname.replace(/^www\./, "");
                    } catch {
                        // Malformed URL from the provider — leave source blank.
                    }
                    const rawCategory = item.category?.[0];
                    const category = rawCategory
                        ? rawCategory.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                        : "Travel";
                    const blurb =
                        item.description && item.description.length > 160
                            ? `${item.description.slice(0, 160).trim()}…`
                            : item.description || "";

                    return {
                        id: item.id,
                        headline: item.title,
                        blurb,
                        url: item.url,
                        source,
                        category,
                        publishedAt: item.published,
                    };
                })
                // Newest first, guaranteed — don't just trust API ordering.
                .sort((a, b) => parseNewsDate(b.publishedAt) - parseNewsDate(a.publishedAt));

            if (isCurrent()) {
                // Merge into the whole-session pool and pick the batch from
                // THAT — not from just this one response. That's what makes
                // it impossible for a refresh to regress to older news: even
                // if this particular random category sample happens to have
                // a slow news day, whatever fresher articles we already knew
                // about from earlier fetches are still in the pool and still
                // win the freshest-first sort.
                mergeIntoKnown(articles);
                const batch = computeDisplayBatch();

                setNewsArticles(batch);
                batch.forEach((a) => newsShownIdsRef.current.add(a.id));

                try {
                    window.localStorage.setItem(
                        NEWS_CACHE_KEY,
                        JSON.stringify({
                            articles: [...newsKnownRef.current.values()],
                            fetchedAt: Date.now(),
                        })
                    );
                } catch {
                    // Storage full/disabled — the fetch still succeeded, just won't cache.
                }
            }
        } catch (err) {
            if (isCurrent()) setNewsError(err.message);
        } finally {
            if (isCurrent()) {
                setIsLoadingNews(false);
                setIsRefreshingNews(false);
            }
        }
    }


    useEffect(() => {
        fetchNews({ isInitial: true, useCache: true });
        // Mount-only — fetchNews is stable enough for this single initial call.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Serves the next unseen slice of already-fetched articles (instant),
    // and only hits the API again once that pool is used up — always
    // page 1, so it's a fresh "now", never an older page.
    const handleRefreshNews = () => {
        if (isRefreshingNews) return;
        fetchNews({ isInitial: false, useCache: false });
    };


    const handleHeroScroll = () => {
        const el = heroScrollerRef.current;
        if (!el || !el.firstChild) return;
        const cardWidth = el.firstChild.getBoundingClientRect().width + 16; // gap-4
        const index = Math.round(el.scrollLeft / cardWidth);
        setActiveShowcase(Math.max(0, Math.min(index, DESTINATIONS.length - 1)));
    };

    const scrollHero = (direction) => {
        const el = heroScrollerRef.current;
        if (!el || !el.firstChild) return;
        const cardWidth = el.firstChild.getBoundingClientRect().width + 16;
        el.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
    };

    const scrollHeroToIndex = (index) => {
        const el = heroScrollerRef.current;
        if (!el || !el.firstChild) return;
        const cardWidth = el.firstChild.getBoundingClientRect().width + 16;
        el.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    };


    useEffect(() => {
        try {
            window.localStorage.setItem(SAVED_KEY, JSON.stringify(savedSlugs));
        } catch {

        }
    }, [savedSlugs]);

    const toggleSaved = (slug) => {
        setSavedSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    };

    const [recommendedDestinations, setRecommendedDestinations] = useState({ basedOn: null, items: [] });
    const [isRecLoading, setIsRecLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setIsRecLoading(true);
            try {
                // Read what the user has viewed most from Local Storage
                const viewHistory = JSON.parse(window.localStorage.getItem("auraavenue:viewHistory")) || [];
                
                // Send history to backend smart engine
                const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/destinations/recommended`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ viewHistory })
                });
                const data = await res.json();
                
                if (data.success) {
                    const formattedItems = data.data.map(item => {
                        const cleanCityName = item.city || "Destination";
                        
                        // 1. Get raw image URL from backend
                        let rawImage = item.imageUrl || item.wikiThumbnail;
                        
                        // 2. Set our fast Pexels landscape fallback
                        let optimizedImage = "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"; 
                        
                        // 3. Bulletproof Compression: Shrink Unsplash and Pexels URLs on the fly
                        if (rawImage && rawImage !== "needs-fetch") {
                            if (rawImage.includes('unsplash.com')) {
                                const baseUrl = rawImage.split('?')[0].split('&')[0];
                                optimizedImage = `${baseUrl}?w=600&h=400&fit=crop&q=70&auto=format`;
                            } else if (rawImage.includes('pexels.com')) {
                                const baseUrl = rawImage.split('?')[0];
                                optimizedImage = `${baseUrl}?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop`;
                            } else {
                                optimizedImage = rawImage; // Keep Wiki thumbnails as-is
                            }
                        }

                        return {
                            slug: cleanCityName.toLowerCase().replace(/\s+/g, '-'),
                            latitude: 0,
                            longitude: 0,
                            name: cleanCityName,
                            country: item.country || "Global",
                            rating: item.rating || "4.8",
                            price: 650,
                            bestTime: "Apr - Oct",
                            image: optimizedImage // Pass the blazing fast image!
                        };
                    });
                    
                    setRecommendedDestinations({
                        basedOn: data.basedOn,
                        items: formattedItems
                    });
                }
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            } finally {
                setIsRecLoading(false);
            }
        };
        fetchRecommendations();
    }, []);
    
    const scrollRecommended = (direction) => {
        const el = recommendedScrollerRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * Math.min(el.clientWidth * 0.9, 600), behavior: "smooth" });
    };



    useEffect(() => {
        const timer = window.setTimeout(() => setContentReady(true), 700);
        return () => window.clearTimeout(timer);
    }, []);


    useEffect(() => {
        const controllers = DESTINATIONS.map(() => new AbortController());

        DESTINATIONS.forEach((dest, i) => {
            setWeather((prev) => ({ ...prev, [dest.slug]: { status: "loading" } }));

            const url = `${WEATHER_ENDPOINT}?latitude=${dest.latitude}&longitude=${dest.longitude}&current_weather=true`;
            fetch(url, { signal: controllers[i].signal })
                .then((res) => {
                    if (!res.ok) throw new Error(`Request failed with ${res.status}`);
                    return res.json();
                })
                .then((data) => {
                    const cw = data.current_weather;
                    setWeather((prev) => ({
                        ...prev,
                        [dest.slug]: { status: "success", temp: Math.round(cw.temperature), code: cw.weathercode },
                    }));
                })
                .catch((err) => {
                    if (err.name !== "AbortError") {
                        console.error(`Weather fetch failed for ${dest.name}:`, err);
                        setWeather((prev) => ({ ...prev, [dest.slug]: { status: "error" } }));
                    }
                });
        });

        return () => controllers.forEach((c) => c.abort());
    }, []);

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-white text-[#14201A]">

                {/* ---------- Hero ---------- */}
                <section className="relative overflow-hidden bg-[#0F1D16]">
                    {/* Ambient glow on the text side — no photo behind this panel at all */}
                    <div className="pointer-events-none absolute -left-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#167A44]/25 blur-3xl" aria-hidden="true" />

                    <style>{`
            .aura-scroll-hide::-webkit-scrollbar { display: none; }
            .aura-scroll-hide { scrollbar-width: none; -ms-overflow-style: none; }
          `}</style>

                    <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24">
                        {/* Text column — solid color, no image behind the copy */}
                        <div>
                            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#3DD68C]">
                                <PinIcon className="h-3.5 w-3.5" />
                                Handpicked Journeys
                            </span>

                            <h1 className="mt-6 font-serif text-4xl italic leading-[1.15] text-white sm:text-5xl lg:text-[3.4rem]">
                                Adventures that
                                <br />
                                <span className="not-italic font-sans text-3xl font-extrabold uppercase tracking-tight text-[#3DD68C] sm:text-4xl lg:text-5xl">
                                    Stay With You
                                </span>
                            </h1>

                            <p className="mt-6 max-w-md text-base text-white/70 sm:text-lg">
                                From cliffside sunsets to ancient temple gates — we sort out the
                                logistics so you can just show up and explore.
                            </p>

                            <div className="mt-9 flex flex-wrap items-center gap-3">
                                <Link
                                    to="/destinations"
                                    className="rounded-full bg-[#3DD68C] px-7 py-3.5 text-sm font-bold text-[#0F1D16] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-6px_rgba(61,214,140,0.5)] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                                >
                                    Browse Destinations
                                </Link>
                                <Link
                                    to="/packages"
                                    className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                                >
                                    View Packages
                                </Link>
                            </div>

                            <div className="mt-7 flex items-center gap-2">
                                <StarIcon className="h-4 w-4 text-[#F2A93B]" />
                                <span className="text-sm text-white/80">
                                    <strong className="font-bold text-white">4.9/5</strong> from 12,400+ travelers
                                </span>
                            </div>
                        </div>

                        {/* Image column — swipe on mobile, arrow buttons on desktop; not a
                static full-bleed photo */}
                        <div className="relative">
                            <div
                                className="absolute -right-5 -top-5 hidden h-full w-full rounded-[2rem] border-2 border-[#3DD68C]/30 sm:block lg:-right-7 lg:-top-7"
                                aria-hidden="true"
                            />

                            <div
                                ref={heroScrollerRef}
                                onScroll={handleHeroScroll}
                                className="aura-scroll-hide relative flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth rounded-[2rem]"
                            >
                                {DESTINATIONS.map((dest) => (
                                    <div
                                        key={dest.slug}
                                        className="relative aspect-[4/3] w-full flex-shrink-0 snap-center overflow-hidden rounded-[2rem] shadow-2xl sm:aspect-[16/11] lg:aspect-[4/5]"
                                    >
                                        <SmartImage
                                            src={dest.image}
                                            alt={`${dest.name}, ${dest.country}`}
                                            priority={dest.slug === DESTINATIONS[0].slug}
                                            fallbackLabel={dest.name}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F1D16]/80 to-transparent px-5 py-4">
                                            <p className="text-sm font-bold text-white">{dest.name}</p>
                                            <p className="text-xs text-white/70">{dest.country}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop-only nudge arrows */}
                            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-2 lg:flex">
                                <button
                                    type="button"
                                    onClick={() => scrollHero(-1)}
                                    aria-label="Previous destination photo"
                                    className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#14201A] shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DD68C] focus-visible:ring-offset-1"
                                >
                                    <ArrowIcon className="h-4 w-4 rotate-180" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollHero(1)}
                                    aria-label="Next destination photo"
                                    className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#14201A] shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DD68C] focus-visible:ring-offset-1"
                                >
                                    <ArrowIcon className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Swipe dots — the real interactive cue for touch/Android users */}
                            <div className="mt-4 flex justify-center gap-1.5 lg:hidden" role="tablist" aria-label="Destination photo selector">
                                {DESTINATIONS.map((dest, i) => (
                                    <button
                                        key={dest.slug}
                                        type="button"
                                        role="tab"
                                        aria-selected={i === activeShowcase}
                                        aria-label={`Show ${dest.name} photo`}
                                        onClick={() => scrollHeroToIndex(i)}
                                        className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DD68C] ${i === activeShowcase ? "w-6 bg-[#3DD68C]" : "w-2 bg-white/25"
                                            }`}
                                    />
                                ))}
                            </div>

                            <div className="absolute -bottom-6 left-4 hidden rounded-2xl border border-[#E5E7E0] bg-white px-5 py-4 shadow-xl sm:-left-8 sm:block">
                                <div className="flex items-center gap-2">
                                    <PinIcon className="h-4 w-4 text-[#167A44]" />
                                    <span className="text-sm font-bold text-[#14201A]">1000+ destinations</span>
                                </div>
                                <p className="mt-0.5 text-xs text-[#6B7167]">across 6 continents</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------- Trust strip ---------- */}
                <section className="border-b border-[#E5E7E0] bg-[#F5F4EF]">
                    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 lg:grid-cols-4 lg:px-10">
                        {TRUST_POINTS.map((point) => (
                            <div key={point.title} className="flex items-start gap-3">
                                <CheckIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1EA35B]" />
                                <div>
                                    <p className="text-sm font-semibold text-[#14201A]">
                                        {point.title}
                                    </p>
                                    <p className="text-xs text-[#6B7167]">{point.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ---------- Recommended for you ---------- */}
                <section className="mx-auto max-w-7xl px-6 pt-16 lg:px-10 lg:pt-24">
                    <style>{`
            .aura-scroll-hide::-webkit-scrollbar { display: none; }
            .aura-scroll-hide { scrollbar-width: none; -ms-overflow-style: none; }
          `}</style>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#167A44]">
                                Recommended for you
                            </span>
                            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#14201A] sm:text-4xl">
                                {recommendedDestinations.basedOn
                                    ? `Because you viewed ${recommendedDestinations.basedOn}`
                                    : "Popular picks to get you started"}
                            </h2>
                            <p className="mt-1.5 text-sm text-[#6B7167]">
                                {recommendedDestinations.basedOn
                                    ? "More destinations that match what you've been exploring."
                                    : "Tap the heart on any destination below to personalize this."}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => scrollRecommended(-1)}
                                aria-label="Scroll recommendations left"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7E0] bg-white text-[#3B443E] transition hover:bg-[#F5F4EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#167A44] focus-visible:ring-offset-1"
                            >
                                <ArrowIcon className="h-4 w-4 rotate-180" />
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollRecommended(1)}
                                aria-label="Scroll recommendations right"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7E0] bg-white text-[#3B443E] transition hover:bg-[#F5F4EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#167A44] focus-visible:ring-offset-1"
                            >
                                <ArrowIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div
                        ref={recommendedScrollerRef}
                        className="aura-scroll-hide mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
                    >
                        {isRecLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="w-72 flex-shrink-0 snap-start">
                                    <DestinationCardSkeleton />
                                </div>
                            ))
                        ) : recommendedDestinations.items.length === 0 ? (
                            <p className="rounded-2xl border border-dashed border-[#E5E7E0] px-6 py-10 text-center text-sm text-[#6B7167]">
                                Check out some destinations to get personalized recommendations!
                            </p>
                        ) : (
                            recommendedDestinations.items.map((dest) => (
                                <DestinationCard
                                    key={dest.slug}
                                    dest={dest}
                                    weatherEntry={weather[dest.slug]}
                                    isSaved={savedSlugs.includes(dest.slug)}
                                    onToggleSave={toggleSaved}
                                    compact
                                />
                            ))
                        )}
                    </div>
                </section>

                {/* ---------- News & updates ---------- */}
                <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#167A44]">
                                Travel news
                            </span>
                            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#14201A] sm:text-4xl">
                                Updates from tours around the world
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={handleRefreshNews}
                            disabled={isLoadingNews || isRefreshingNews}
                            aria-label="Show different travel news"
                            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E5E7E0] bg-white px-4 py-2 text-sm font-semibold text-[#3B443E] transition hover:bg-[#F5F4EF] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#167A44] focus-visible:ring-offset-1"
                        >
                            <RefreshIcon className={`h-4 w-4 ${isRefreshingNews ? "animate-spin" : ""}`} />
                            {isRefreshingNews ? "Refreshing…" : "Refresh news"}
                        </button>
                    </div>

                    <div className="mt-8 space-y-4">
                        {isLoadingNews ? (
                            Array.from({ length: 5 }).map((_, i) => <NewsItemSkeleton key={i} />)
                        ) : newsError ? (
                            <p className="rounded-2xl border border-dashed border-[#F2A93B]/40 bg-[#FEF3E2] px-6 py-8 text-center text-sm text-[#8A5A0A]">
                                Couldn't load live news right now: {newsError}
                            </p>
                        ) : newsArticles.length === 0 ? (
                            <p className="rounded-2xl border border-dashed border-[#E5E7E0] px-6 py-8 text-center text-sm text-[#6B7167]">
                                No travel news to show right now — check back soon.
                            </p>
                        ) : (
                            newsArticles.map((item) => <NewsItem key={item.id} item={item} />)
                        )}
                    </div>


                </section>

                {/* ---------- Featured packages ---------- */}
                <section className="bg-[#F5F4EF] py-16 lg:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-10">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wide text-[#167A44]">
                                    Featured packages
                                </span>
                                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#14201A] sm:text-4xl">
                                    Trips we&rsquo;ve already planned for you
                                </h2>
                            </div>
                            <Link
                                to="/packages"
                                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#167A44] hover:text-[#125E36]"
                            >
                                View all packages
                                <ArrowIcon className="h-4 w-4 transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {!contentReady ? (
                                Array.from({ length: 4 }).map((_, i) => <PackageCardSkeleton key={i} />)
                            ) : PACKAGES.length === 0 ? (
                                <p className="col-span-full rounded-2xl border border-dashed border-[#E5E7E0] bg-white py-12 text-center text-sm text-[#6B7167]">
                                    No packages to show right now — check back soon.
                                </p>
                            ) : (
                                PACKAGES.map((pkg) => (
                                    <Link
                                        key={pkg.slug}
                                        to={`/packages/${pkg.slug}`}
                                        className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7E0] bg-white transition-shadow hover:shadow-lg sm:flex-row"
                                    >
                                        <div className="h-40 w-full flex-shrink-0 overflow-hidden sm:h-auto sm:w-44">
                                            <SmartImage
                                                src={pkg.image}
                                                alt={pkg.name}
                                                fallbackLabel={pkg.name}
                                                className="h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col p-5">
                                            <span className="inline-block w-fit rounded-full bg-[#1EA35B]/10 px-3 py-1 text-xs font-semibold text-[#167A44]">
                                                {pkg.tag}
                                            </span>
                                            <h3 className="mt-3 text-lg font-bold text-[#14201A] transition-colors duration-300 motion-reduce:transition-none group-hover:text-[#167A44]">
                                                {pkg.name}
                                            </h3>
                                            <p className="mt-1.5 text-sm text-[#6B7167]">
                                                {pkg.blurb}
                                            </p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-xs font-medium text-[#8A9089]">
                                                    {pkg.days} days / {pkg.nights} nights
                                                </span>
                                                <span className="text-base font-bold text-[#14201A]">
                                                    {formatINR(pkg.price)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </section>

            </div>
        </ErrorBoundary>
    );
}
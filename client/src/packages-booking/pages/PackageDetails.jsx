import { useParams, useNavigate } from "react-router-dom";
import { 
    FaMapMarkerAlt, 
    FaClock, 
    FaStar, 
    FaArrowLeft, 
    FaCheckCircle, 
    FaEllipsisV 
} from "react-icons/fa";
import PackageSection from "../components/PackageSection";
import PackageMap from "../components/PackageMap";
import { useState, useEffect } from "react";

const createSlug = (title) => {
    if (!title) return "";
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// --- FALLBACK MOCK DATA (Used if DB has no reviews yet) ---
const fallbackReviews = [
    {
        id: 1,
        author: "Kiran Vaghela",
        avatar: "https://ui-avatars.com/api/?name=Kiran+Vaghela&background=10b981&color=fff",
        badges: "Local Guide · 150 reviews",
        rating: 5,
        date: new Date("2026-07-05").getTime(),
        time: "a month ago",
        text: "Booked this package recently for a weekend getaway with my family and honestly, we had a really good time.",
        tags: ["Guide", "Accommodation"]
    }
];

const sortOptions = ["Most relevant", "Newest", "Highest", "Lowest"];
const availableReviewTags = ["Guide", "Accommodation", "Food", "Transport", "Value for money"];

// --- REVIEW SECTION COMPONENT ---
// Receives userData and the packageId to handle auth and backend saving
const ReviewSection = ({ userData, packageId, initialReviews = [] }) => {
    // Load reviews from DB, fallback to mock data if empty
    const [reviews, setReviews] = useState(initialReviews.length > 0 ? initialReviews : fallbackReviews);
    const [activeTag, setActiveTag] = useState("All");
    const [activeSort, setActiveSort] = useState("Most relevant");
    
    // Form State
    const [showForm, setShowForm] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newReviewText, setNewReviewText] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- RESET / SYNC REVIEWS WHEN PACKAGE CHANGES ---
    useEffect(() => {
        setReviews(initialReviews.length > 0 ? initialReviews : fallbackReviews);
        setShowForm(false);
        setNewReviewText("");
        setSelectedTags([]);
        setActiveTag("All");
        setActiveSort("Most relevant");
    }, [packageId, initialReviews]);

    // --- USER SETUP ---
    const userName = userData?.name || userData?.fullName || "User";
    const userInitial = userName.trim()[0].toUpperCase();
    const userAvatar = `https://ui-avatars.com/api/?name=${userName}&background=167A44&color=fff`;

    // --- DYNAMIC CALCULATIONS ---
    const totalReviews = reviews.length;
    const averageRating = totalReviews === 0 
        ? 0 
        : (reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews).toFixed(1);

    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { 
        if (starCounts[r.rating] !== undefined) starCounts[r.rating]++; 
    });

    const bars = [5, 4, 3, 2, 1].map(star => ({
        stars: star,
        percent: totalReviews === 0 ? 0 : Math.round((starCounts[star] / totalReviews) * 100)
    }));

    const dynamicTags = [{ label: "All", count: null }];
    availableReviewTags.forEach(tag => {
        const count = reviews.filter(r => r.tags && r.tags.includes(tag)).length;
        if (count > 0) dynamicTags.push({ label: tag, count });
    });

    // --- FILTER & SORT LOGIC ---
    let displayedReviews = [...reviews].filter(review => 
        activeTag === "All" || (review.tags && review.tags.includes(activeTag))
    );

    displayedReviews.sort((a, b) => {
        if (activeSort === "Newest") return b.date - a.date;
        if (activeSort === "Highest") return b.rating - a.rating;
        if (activeSort === "Lowest") return a.rating - b.rating;
        return (b.rating * 1000000000000 + b.date) - (a.rating * 1000000000000 + a.date);
    });

    // --- FORM HANDLERS ---
    const toggleTagSelection = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleWriteReviewClick = () => {
        if (!userData) {
            alert("Please sign in to your account first to write a review.");
            return;
        }
        setShowForm(!showForm);
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!newReviewText.trim()) return;
        setIsSubmitting(true);

        const newRev = {
            author: userName,
            avatar: userAvatar,
            badges: "Verified Traveler", 
            rating: newRating,
            time: "Just now",
            text: newReviewText,
            tags: selectedTags
        };

        try {
            // Send to backend
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/packages/${packageId}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRev)
            });

            const data = await res.json();

            if (data.success) {
                // Instantly update UI with the saved review from backend
                setReviews([data.review, ...reviews]);
                setShowForm(false);
                setNewReviewText("");
                setNewRating(5);
                setSelectedTags([]);
                setActiveSort("Newest"); 
                setActiveTag("All"); 
            } else {
                alert(data.message || "Failed to post review");
            }
        } catch (error) {
            console.error("Error posting review:", error);
            alert("Server connection error. Try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 w-full font-sans mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Review Summary</h2>
                <button 
                    onClick={handleWriteReviewClick}
                    className="border-2 border-[#167A44] text-[#167A44] bg-white hover:bg-green-50 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm hover:shadow"
                >
                    {showForm ? "Cancel Review" : "Write a review"}
                </button>
            </div>

            {/* Inline Review Form (Only visible if logged in and form is open) */}
            {showForm && userData && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-10 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                        <div className="w-10 h-10 rounded-full bg-[#167A44] text-white font-bold text-lg flex items-center justify-center shadow-md">
                            {userInitial}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 leading-none">{userName}</h3>
                            <span className="text-xs text-gray-500">Posting publicly</span>
                        </div>
                    </div>
                    
                    <form onSubmit={handleAddReview}>
                        <div className="flex gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar 
                                    key={star} 
                                    onClick={() => setNewRating(star)}
                                    className={`text-2xl cursor-pointer transition-colors ${star <= newRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`} 
                                />
                            ))}
                        </div>

                        {/* Tag Selection */}
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-600 mb-2">What stood out to you? (Optional)</p>
                            <div className="flex flex-wrap gap-2">
                                {availableReviewTags.map((tag) => (
                                    <button
                                        type="button"
                                        key={tag}
                                        onClick={() => toggleTagSelection(tag)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                                            selectedTags.includes(tag)
                                                ? 'bg-green-50 border-[#167A44] text-[#167A44] shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <textarea 
                            rows="3"
                            value={newReviewText}
                            onChange={(e) => setNewReviewText(e.target.value)}
                            placeholder="Share details of your own experience at this place"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-[#167A44]/50 focus:border-[#167A44] transition-all resize-none"
                            required
                        ></textarea>
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="text-gray-500 hover:text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#167A44] hover:bg-[#125E36] disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm"
                            >
                                {isSubmitting ? "Posting..." : "Post Review"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats Area */}
            <div className="flex flex-col md:flex-row gap-10 mb-10 border-b border-gray-200/60 pb-10">
                <div className="flex-1 flex flex-col-reverse gap-2 justify-center">
                    {bars.map((bar) => (
                        <div key={bar.stars} className="flex items-center gap-4">
                            <span className="text-gray-600 font-medium text-sm w-3">{bar.stars}</span>
                            <div className="flex-1 h-3 bg-gray-200/80 rounded-full overflow-hidden shadow-inner">
                                <div 
                                    className="h-full bg-yellow-400 rounded-full transition-all duration-500" 
                                    style={{ width: `${bar.percent}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="md:w-48 flex flex-col items-center justify-center bg-white/40 rounded-3xl p-6 border border-white/60 shadow-sm">
                    <span className="text-7xl font-extrabold text-gray-800 drop-shadow-sm mb-2">{averageRating}</span>
                    <div className="flex text-yellow-400 text-lg mb-2 gap-1 drop-shadow-sm">
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < Math.round(averageRating) ? "" : "text-gray-300"} />
                        ))}
                    </div>
                    <span className="text-gray-500 font-medium">{totalReviews} reviews</span>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-6">Filter Reviews</h3>

            {/* Tags Filter */}
            <div className="flex flex-wrap gap-3 mb-8">
                {dynamicTags.map((tag, idx) => {
                    const isActive = activeTag === tag.label;
                    return (
                        <button
                            key={idx}
                            onClick={() => setActiveTag(tag.label)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full border text-sm font-bold transition-all shadow-sm
                                ${isActive 
                                    ? 'bg-green-50 border-[#167A44] text-[#167A44]' 
                                    : 'bg-white/80 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                        >
                            {tag.label} 
                            {tag.count && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-md ${isActive ? 'bg-green-200/50' : 'bg-gray-100'}`}>
                                    {tag.count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Sort Options */}
            <div className="mb-6 flex items-center gap-4">
                <span className="block text-gray-500 font-medium text-sm">Sort by:</span>
                <div className="flex flex-wrap gap-2">
                    {sortOptions.map((sort, idx) => {
                        const isActive = activeSort === sort;
                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveSort(sort)}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all
                                    ${isActive 
                                        ? 'bg-green-50 text-[#167A44] shadow-sm' 
                                        : 'bg-transparent text-gray-500 hover:bg-white hover:shadow-sm'
                                    }`}
                            >
                                {sort}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-6 mt-8">
                {displayedReviews.length > 0 ? displayedReviews.map((review) => (
                    <div key={review.id} className="pt-6 border-t border-gray-200/60 animate-fade-in">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex gap-4 items-center">
                                <div className="relative">
                                    {review.avatar ? (
                                         <img src={review.avatar} alt={review.author} className="w-12 h-12 rounded-full shadow-md border-2 border-white" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-[#167A44] text-white font-bold text-xl flex items-center justify-center shadow-md border-2 border-white">
                                            {review.author?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg leading-none mb-1">{review.author}</h4>
                                    <p className="text-gray-500 text-xs font-medium">{review.badges}</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-emerald-500 p-2 transition-colors">
                                <FaEllipsisV />
                            </button>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex text-yellow-400 text-sm drop-shadow-sm">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={i < review.rating ? '' : 'text-gray-300'} />
                                ))}
                            </div>
                            <span className="text-gray-400 text-sm font-medium">{review.time || new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            {review.text} 
                            {review.text.length > 150 && <span className="text-[#167A44] font-semibold cursor-pointer hover:underline ml-1">... More</span>}
                        </p>
                    </div>
                )) : (
                    <div className="text-center py-8 bg-white/40 rounded-2xl border border-white/60">
                        <p className="text-gray-500 font-medium">No reviews found for this filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
function PackageDetails({ packages, onBookNow, onViewDetails, userData }) {
    const { packageId } = useParams();
    const navigate = useNavigate();

    const selectedPackage = packages.find(
        (p) => createSlug(p.title) === packageId
    );

    if (!selectedPackage) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-gray-500 text-xl font-semibold">Loading or Package not found...</p>
            </div>
        );
    }

    let similarPackages = packages
        .filter((p) => p._id !== selectedPackage._id &&
            p.type === selectedPackage.type &&
            (p.location === selectedPackage.location || p.country === selectedPackage.country)
        )

    if (similarPackages.length === 0) {
        similarPackages = packages.filter(
            (p) => p._id !== selectedPackage._id && p.type === selectedPackage.type
        );
    }
    similarPackages = similarPackages.slice(0, 7); 

    const formatAboutText = (text) => {
        if (!text) return null;
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const paragraphs = [];
        for (let i = 0; i < sentences.length; i += 2) {
            paragraphs.push(sentences.slice(i, i + 2).join(' ').trim());
        }
        return paragraphs.map((para, index) => (
            <p key={index} className="mb-5 leading-relaxed text-gray-600 text-lg">
                {index === 0 ? (
                    <span className="float-left mr-3 mt-1.5 text-5xl font-extrabold text-[#167A44] leading-none drop-shadow-sm">
                        {para.charAt(0)}
                    </span>
                ) : null}
                {index === 0 ? para.slice(1) : para}
            </p>
        ));
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <section
                className="relative h-[450px] lg:h-[550px] bg-cover bg-center flex items-end pb-12"
                style={{ backgroundImage: `url(${selectedPackage.image})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                <div className="relative max-w-7xl mx-auto px-6 w-full text-white">
                    <button
                        onClick={() => navigate(-1)} 
                        className="mb-6 bg-white/20 backdrop-blur-md border border-white/30 px-5 py-2 rounded-full flex items-center gap-2 hover:bg-white/30 transition-all duration-300 cursor-pointer shadow-sm"
                    >
                        <FaArrowLeft /> Back
                    </button>
                    <div className="flex gap-3 mb-4">
                        <span className="bg-[#167A44]/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold shadow-lg border border-green-400/30">
                            {selectedPackage.badge || selectedPackage.type}
                        </span>
                        <span className="bg-white/30 backdrop-blur-xl border border-white/40 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                            <FaStar className="text-yellow-400" /> {selectedPackage.rating}
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                        {selectedPackage.title}
                    </h1>
                    <div className="flex flex-wrap gap-5 text-gray-200 text-lg font-medium">
                        <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-green-400"/> {selectedPackage.location}</span>
                        <span className="flex items-center gap-2"><FaClock className="text-green-400"/> {selectedPackage.duration}</span>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 space-y-8">
                {/* ROW 1: ABOUT & PRICE */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-5">About</h2>
                        <div className="text-gray-600 leading-relaxed text-lg mb-8">
                            {selectedPackage.about ? (
                                formatAboutText(selectedPackage.about)
                            ) : (
                                <p className="text-gray-600 leading-relaxed text-lg mb-8">
                                    Experience the trip of a lifetime with our meticulously crafted {selectedPackage.title} package.
                                    Immerse yourself in the beauty of {selectedPackage.location} over {selectedPackage.duration}.
                                </p>
                            )}
                        </div>

                        <h3 className="text-2xl font-bold text-gray-800 mb-5">What's Included</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedPackage.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-[#167A44] font-bold bg-green-50/80 px-4 py-3 rounded-2xl border border-green-100 shadow-sm">
                                    <FaCheckCircle className="text-[#167A44] text-xl" /> {feature}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 sticky top-6 self-start">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Book Your Trip</h2>
                        <p className="text-gray-500 font-medium mb-6">Secure your spot today!</p>
                        <div className="flex items-end gap-3 mb-1">
                            <span className="text-4xl font-extrabold text-[#167A44] drop-shadow-sm">
                                ₹{selectedPackage.price.toLocaleString()}
                            </span>
                            <span className="text-gray-500 mb-1 font-bold">/ person</span>
                        </div>
                        <p className="text-gray-400 line-through text-lg font-medium mb-8">
                            ₹{selectedPackage.originalPrice.toLocaleString()}
                        </p>
                        <button
                            onClick={() => onBookNow(selectedPackage)}
                            className="cursor-pointer w-full rounded-2xl py-4 font-bold text-lg text-white flex justify-center items-center gap-3 bg-gradient-to-r from-[#167A44] to-[#125E36] hover:from-[#125E36] hover:to-green-800 shadow-[0_10px_20px_rgba(22,122,68,0.3)] hover:shadow-[0_15px_25px_rgba(22,122,68,0.4)] transition-all duration-300 hover:-translate-y-1"
                        >
                            Book Now
                        </button>
                    </div>
                </div>

                {/* ROW 2: ITINERARY & MAP */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8">Itinerary</h2>
                        <div className="relative border-l-2 border-green-200 ml-4 space-y-8">
                            {selectedPackage.itinerary.map((item, idx) => (
                                <div key={idx} className="relative pl-8">
                                    <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-[#167A44] border-4 border-white shadow-sm"></div>
                                    <h3 className="font-bold text-gray-800 text-lg">Day {idx + 1}</h3>
                                    <p className="text-gray-600 font-medium mt-2 leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="lg:col-span-2 bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 flex flex-col">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Locations Covered</h2>
                        <div className="flex-1 w-full relative rounded-2xl overflow-hidden shadow-inner">
                            <PackageMap
                                locationString={selectedPackage.location}
                                country={selectedPackage.country}
                            />
                        </div>
                    </div>
                </div>

                {/* ROW 3: REVIEWS SECTION */}
                <ReviewSection 
                     key={selectedPackage._id}
                     userData={userData} 
                     packageId={selectedPackage._id} 
                     initialReviews={selectedPackage.reviews || []} 
                />

                {/* ROW 4: SIMILAR PACKAGES */}
                {similarPackages.length > 0 && (
                    <div className="pt-4">
                        <PackageSection
                            title="Similar Packages"
                            packages={similarPackages}
                            onBookNow={onViewDetails}
                        />
                    </div>
                )}
            </section>
        </div>
    );
}

export default PackageDetails;
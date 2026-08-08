import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUsers, FaBed, FaSuitcase } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Component: MyBookings
// Purpose: Fetches and displays all active travel package bookings associated with the logged-in user's email address.
const MyBookings = ({ userData }) => {
    // State: Holds array of filtered booking records for the logged-in user
    const [bookings, setBookings] = useState([]);
    // State: Handles loading indicator during API data fetch
    const [loading, setLoading] = useState(true);

    // Effect: Fetches bookings list on mount or when userData email changes
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/bookings`);
                const data = await res.json();
                if (data.success) {
                    // Filter bookings matching the logged-in user's email
                    const userBookings = data.data.filter(b => b.email === userData.email);
                    setBookings(userBookings);
                }
            } catch (err) {
                console.error("Failed to fetch bookings:", err);
            } 
                setLoading(false);
            
        };

        if (userData?.email) {
            fetchBookings();
        } else {
            setLoading(false);
        }
    }, [userData]);

    // LOADING STATE: Displays spinner/message while fetching booking data
    if (loading) {
        return (
            <div className="flex justify-center items-center h-48 sm:h-64 text-gray-500 font-medium text-sm sm:text-base">
                Loading your bookings...
            </div>
        );
    }

    return (
        <div className="w-full space-y-4 sm:space-y-6 box-border">
            {/* Main Outer Card */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm box-border">
                
                {/* Section Header */}
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-3 border-gray-100">
                    My Bookings
                </h3>

                {/* EMPTY STATE: Rendered when user has no booked packages */}
                {bookings.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 box-border">
                        <FaSuitcase className="mx-auto text-3xl sm:text-4xl text-gray-300 mb-3" />
                        <p className="text-sm sm:text-base text-gray-500 font-medium">You haven't booked any packages yet.</p>
                        <Link 
                            to="/packages" 
                            className="inline-block mt-4 bg-emerald-50 text-[#167A44] px-5 sm:px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-emerald-100 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#167A44]"
                        >
                            Explore Packages
                        </Link>
                    </div>
                ) : (
                    /* BOOKINGS LIST: Renders cards stacked vertically */
                    <div className="grid gap-4 sm:gap-5">
                        {bookings.map((b) => (
                            /* Individual Booking Card */
                            <div 
                                key={b._id} 
                                className="p-4 sm:p-5 border border-gray-100 bg-gray-50 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200 ease-in-out hover:shadow-md hover:bg-white box-border"
                            >
                                {/* Left Section: Package Details & Metadata */}
                                <div className="w-full md:w-auto flex-1 min-w-0">
                                    <h4 className="font-bold text-base sm:text-lg text-gray-900 truncate" title={b.packageTitle}>
                                        {b.packageTitle}
                                    </h4>
                                    
                                    {/* Travel Specifications Badges (flex-wrap ensures clean wrapping on small phones) */}
                                    <div className="flex flex-wrap gap-2.5 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 font-medium">
                                        <span className="flex items-center gap-1.5 shrink-0">
                                            <FaCalendarAlt className="text-[#167A44]" /> {b.travelDate}
                                        </span>
                                        <span className="flex items-center gap-1.5 shrink-0">
                                            <FaUsers className="text-[#167A44]" /> {b.travellers} Travellers
                                        </span>
                                        <span className="flex items-center gap-1.5 shrink-0">
                                            <FaBed className="text-[#167A44]" /> {b.roomType}
                                        </span>
                                    </div>
                                </div>

                                {/* Right Section: Pricing & Status */}
                                <div className="w-full md:w-auto text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-gray-200 flex flex-col justify-center shrink-0">
                                    <span className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                                        Total Amount
                                    </span>
                                    <span className="text-xl sm:text-2xl font-black text-[#167A44]">
                                        ₹{b.totalAmount?.toLocaleString('en-IN')}
                                    </span>
                                    {/* Status Pill Badge */}
                                    <span className="block mt-2 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full w-fit md:ml-auto">
                                        {b.bookingStatus || 'Confirmed'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
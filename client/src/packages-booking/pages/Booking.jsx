import { useState } from "react";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import BookingForm from "../components/BookingForm";
import { useParams, useNavigate } from 'react-router-dom';

function Booking({ selectedPackage, onBack, onContinue }) {
    const { packageId } = useParams();
    const navigate = useNavigate();

    const [bookingData, setBookingData] = useState({
        name: "",
        email: "",
        phone: "",
        departureDate: "",
        travellers: 2,
        roomType: "Standard",
        services: [],
    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    // --- NEW OTP STATES ---
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpStatus, setOtpStatus] = useState("idle"); // idle | verifying | verified
    const [otpError, setOtpError] = useState("");

    const validateBooking = () => {
        const newErrors = {};
        if (!bookingData.name.trim()) newErrors.name = "Name is required";

        if (!bookingData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email)) {
            newErrors.email = "Enter a valid email";
        }

        if (!bookingData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[0-9]{10}$/.test(bookingData.phone)) {
            newErrors.phone = "Phone must contain exactly 10 digits";
        }

        if (!bookingData.departureDate) newErrors.departureDate = "Please select a departure date";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // STEP 1: Validate form, then send OTP
    const handleContinue = async () => {
        setSaveError("");
        setOtpError("");

        // Prevent progressing if the form is empty or invalid
        if (!validateBooking()) {
            setSaveError("Please fill out all required fields correctly.");
            return;
        }

        setIsSaving(true);
        try {
            // Call existing Auth route to generate and send OTP
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: bookingData.email.trim().toLowerCase() })
            });
            const result = await response.json();

            if (result.success) {
                setIsOtpModalOpen(true); // Open the popup
            } else {
                setSaveError(result.message || "Failed to send OTP to that email.");
            }
        } catch (err) {
            console.error(err);
            setSaveError("Unable to connect to the server.");
        } finally {
            setIsSaving(false);
        }
    };

    let total = selectedPackage.price * bookingData.travellers;
    if (bookingData.roomType === "Deluxe") total += 3000;
    if (bookingData.roomType === "Suite") total += 7000;
    if (bookingData.services.includes("Travel Insurance")) total += 999;
    if (bookingData.services.includes("Guided City Tour")) total += 1499;

    // STEP 2: Verify the OTP, then save the booking
    const handleVerifyAndSave = async () => {
        setOtpError("");
        if (!otp.trim()) {
            setOtpError("Please enter the OTP sent to your email.");
            return;
        }

        setOtpStatus("verifying");
        try {
            // Verify OTP via existing Auth route
            const verifyRes = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: bookingData.email.trim().toLowerCase(), otp1: otp })
            });
            const verifyData = await verifyRes.json();

            if (!verifyData.success) {
                setOtpStatus("idle");
                setOtpError(verifyData.message || "Invalid or expired OTP.");
                return;
            }

            setOtpStatus("verified");

            // IF OTP IS CORRECT, SAVE BOOKING TO DB
            const booking = {
                packageId: selectedPackage._id,
                packageTitle: selectedPackage.title,
                travellerName: bookingData.name,
                email: bookingData.email,
                phone: bookingData.phone,
                travellers: bookingData.travellers,
                travelDate: bookingData.departureDate,
                roomType: bookingData.roomType,
                services: bookingData.services,
                totalAmount: total
            };

            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(booking)
            });
            const result = await response.json();

            if (result.success) {
                setIsOtpModalOpen(false);
                onContinue(bookingData); // Move to Booking Summary Page
            } else {
                setOtpStatus("idle");
                setOtpError("Booking verification succeeded, but saving failed.");
            }
        } catch (err) {
            console.error(err);
            setOtpStatus("idle");
            setOtpError("Server connection error during verification.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative">
            {/* Hero */}
            <section className="w-full py-20 bg-gradient-to-r from-emerald-900 via-green-700 to-emerald-500 text-white">
                <div className="max-w-7xl mx-auto px-6 py-20">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 mb-6 px-5 py-2 bg-white/15 backdrop-blur-md border border-white/30 text-white rounded-full hover:bg-white/25 transition-all duration-300"
                    >
                        <FaArrowLeft />
                        Back to Package Details
                    </button>
                    <h1 className="text-5xl font-bold">Book Your Dream Vacation</h1>
                    <p className="mt-4 text-lg">Complete your booking details and get ready for an unforgettable journey.</p>
                </div>
            </section>

            {/* Content */}
            <section className="max-w-7xl mx-auto px-6 py-14">
                <div className="grid grid-cols-1 lg:grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <BookingForm
                            bookingData={bookingData}
                            setBookingData={setBookingData}
                            errors={errors}
                        />
                    </div>

                    <div>
                        <div className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-6 sticky top-6">
                            <h2 className="text-2xl font-bold">Booking Summary</h2>
                            <img
                                src={selectedPackage.image}
                                alt={selectedPackage.title}
                                className="w-full h-48 object-cover rounded-2xl mt-4"
                            />
                            <hr className="my-5" />
                            <div className="space-y-3 text-gray-700">
                                <div className="flex justify-between"><span>Package</span><span>{selectedPackage.title}</span></div>
                                <div className="flex justify-between"><span>Travellers</span><span>{bookingData.travellers}</span></div>
                                <div className="flex justify-between"><span>Duration</span><span>{selectedPackage.duration}</span></div>
                                <div className="flex justify-between"><span>RoomType</span><span>{bookingData.roomType}</span></div>

                                <div className="mt-5 pt-4 border-t border-gray-100">
                                    <h3 className="font-semibold mb-2">Selected Services</h3>
                                    {bookingData.services.length === 0 ? (
                                        <p className="text-gray-400 text-sm">None selected</p>
                                    ) : (
                                        <ul className="space-y-1.5 text-sm text-gray-600">
                                            {bookingData.services.map((service) => (
                                                <li key={service} className="flex items-center gap-2">
                                                    <span className="text-emerald-500">✓</span> {service}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="flex justify-between font-bold text-green-700 text-xl pt-4 border-t mt-4">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {saveError && (
                                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                                    <p className="text-sm font-medium text-red-700">{saveError}</p>
                                </div>
                            )}

                            <button
                                disabled={isSaving}
                                onClick={handleContinue}
                                className={`mt-8 w-full py-4 rounded-2xl font-bold text-lg transition ${isSaving
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] text-white"
                                    }`}
                            >
                                {isSaving ? "Sending OTP..." : "Continue to Review"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* OTP VERIFICATION MODAL */}
            {isOtpModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[999] p-4">
                    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl flex flex-col relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsOtpModalOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-red-500 hover:bg-gray-100 p-2 rounded-full transition"
                        >
                            <FaTimes />
                        </button>

                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            To ensure booking security, an OTP has been sent to <span className="font-bold text-gray-800">{bookingData.email}</span>
                        </p>

                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Enter OTP Code</label>
                        <input
                            type="text"
                            placeholder="6-Digit Code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            disabled={otpStatus === 'verifying' || otpStatus === 'verified'}
                            className="w-full px-4 py-4 rounded-xl border border-gray-300 bg-gray-50 text-center text-xl tracking-[0.5em] font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition mb-2"
                        />

                        {otpError && <p className="text-sm text-red-500 font-medium mb-4 text-center">{otpError}</p>}

                        <button
                            onClick={handleVerifyAndSave}
                            disabled={otpStatus === 'verifying' || otpStatus === 'verified'}
                            className="mt-6 w-full bg-emerald-600 text-white rounded-xl py-4 font-bold text-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {otpStatus === 'verifying' && "Verifying Code..."}
                            {otpStatus === 'verified' && "Verified! Saving Booking..."}
                            {otpStatus === 'idle' && "Verify & Proceed"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Booking;
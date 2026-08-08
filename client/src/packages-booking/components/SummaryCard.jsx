import { useState } from "react";

function SummaryCard({ selectedPackage, bookingData }) {
    // STATE FOR ONE-TIME CLICK / LOADING
    const [isProcessing, setIsProcessing] = useState(false);

    const roomCharges = {
        Standard: 0,
        Deluxe: 3000,
        Suite: 7000
    };
    const serviceCharges = {
        "Travel Insurance": 999,
        "Airport Pickup": 800,
        "Guided City Tour": 1499
    };

    const roomPrice = roomCharges[bookingData.roomType] || 0;
    const services = bookingData?.services || [];
    const servicesPrice = services.reduce((sum, service) => sum + (serviceCharges[service] || 0), 0);
    const packagePrice = selectedPackage.price * bookingData.travellers;
    const grandTotal = packagePrice + roomPrice + servicesPrice;

    // NEW PAYMENT HANDLER WITH EMAIL LOGIC
    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            // Generate a random booking ID for the receipt
            const generatedBookingId = `WW-${Math.floor(100000 + Math.random() * 900000)}`;

            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/bookings/send-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: bookingData.email,
                    bookingDetails: {
                        bookingId: generatedBookingId,
                        packageTitle: selectedPackage.title,
                        travellerName:bookingData.name,
                        travellers: bookingData.travellers,
                        travelDate: bookingData.departureDate,
                        roomType: bookingData.roomType,
                        totalAmount: grandTotal
                    }
                })
            });

            const data = await res.json();
            
            if (data.success) {
                alert(`Payment Gateway will be integrated in the backend phase.\n\nSuccess! Your booking details have been sent to ${bookingData.email}.`);
            } else {
                alert(`Payment Gateway reached, but we failed to send the email: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to the server to send email.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="sticky top-6 rounded-[32px] p-7 bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_25px_50px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1">
            <h2 className="text-2xl font-bold">Package Summary</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-green-300 to-transparent my-6" />
            
            
            <img src={selectedPackage.image} alt={selectedPackage.title} className="rounded-2xl h-52 w-full object-cover" />
            <h2 className="text-2xl font-bold mt-5">{selectedPackage.title}</h2>
            <p className="text-gray-500">{selectedPackage.duration}</p>
            <p className="text-3xl font-bold text-green-700 mt-4">
                ₹{selectedPackage.price.toLocaleString('en-IN')}
                <span className="text-base text-gray-500">/person</span>
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-green-300 to-transparent my-6" />
            
            <div className="space-y-4 mt-6">
                <div className="flex justify-between"><span>Package</span><span>₹{selectedPackage.price.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>Travellers x {bookingData.travellers}</span><span>₹{packagePrice.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>Room ({bookingData.roomType})</span><span>+ ₹{roomPrice.toLocaleString('en-IN')}</span></div>
                {bookingData.services.map((service) => (
                    <div key={service} className="flex justify-between text-gray-600">
                        <span>{service}</span>
                        <span>+ ₹{serviceCharges[service].toLocaleString('en-IN')}</span>
                    </div>
                ))}
                
                <div className="h-px bg-gradient-to-r from-transparent via-green-300 to-transparent my-6" />
                <div className="flex justify-between items-center rounded-2xl bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 p-5 text-2xl font-bold">
                    <span>Grand Total</span>
                    <span className="text-green-700">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
            </div>
            
            <div className="h-px bg-gradient-to-r from-transparent via-green-300 to-transparent my-6" />
            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-green-600"><span>🔒</span><span>Secure SSL Payment</span></div>
                <div className="flex items-center gap-2 text-green-600"><span>⚡</span><span>Instant Booking Confirmation</span></div>
                
                {/* PROCEED TO PAYMENT BUTTON */}
                <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className={`mt-4 w-full rounded-2xl py-4 font-bold text-lg text-white shadow-xl transition-all duration-300 ${
                        isProcessing 
                        ? "bg-gray-400 cursor-not-allowed shadow-none" 
                        : "bg-gradient-to-r from-green-700 via-green-600 to-emerald-500 hover:scale-[1.02] hover:shadow-2xl active:scale-95"
                    }`}
                >
                    {isProcessing ? "Processing..." : "Proceed to Payment"}
                </button>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 mb-3">We Accept</p>
                    <div className="flex justify-center gap-3">
                        <div className="bg-white/60 backdrop-blur-lg border border-green-100 rounded-xl shadow-md px-4 py-2 font-semibold">VISA</div>
                        <div className="bg-white/60 backdrop-blur-lg border border-green-100 rounded-xl shadow-md px-4 py-2 font-semibold">Mastercard</div>
                        <div className="bg-white/60 backdrop-blur-lg border border-green-100 rounded-xl shadow-md px-4 py-2 font-semibold">UPI</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SummaryCard;
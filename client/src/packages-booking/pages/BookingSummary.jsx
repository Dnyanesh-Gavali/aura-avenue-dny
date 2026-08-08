import TravellerCard from "../components/TravellerCard";
import SummaryCard from "../components/SummaryCard";

function BookingSummary({

    selectedPackage,

    bookingData,

    onBack

}) {

    if (!selectedPackage || !bookingData) {
        return (
            <div className="bg-white rounded-3xl shadow-xl p-6">
                <p className="text-gray-500">
                    Loading booking summary...
                </p>
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">

            {/* Hero */}

            <section className="bg-gradient-to-r from-green-900 via-green-800 to-emerald-600 text-white">

                <div className="max-w-7xl mx-auto px-6 py-16">

                    <button
                        onClick={onBack}
                        className="mb-6 bg-white/15 backdrop-blur-lg border border-white/30 text-white px-5 py-2 rounded-full shadow-xl hover:bg-white/25 transition-all duration-300"
                    >
                        ← Back
                    </button>

                    <h1 className="text-5xl font-bold">

                        Booking Review

                    </h1>

                    <p className="mt-4 text-lg">

                        Please review your booking details before payment.

                    </p>

                </div>

            </section>

            <section className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">

                <div className="lg:col-span-2">

                    <TravellerCard

                        bookingData={bookingData}
                    />

                </div>

                <div>

                    <SummaryCard
                        selectedPackage={selectedPackage}
                        bookingData={bookingData}
                    />

                </div>

            </section>

        </div>

    );

}

export default BookingSummary;
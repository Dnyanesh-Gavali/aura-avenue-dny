import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaUsers,
    FaCalendarAlt,
    FaBed,
    FaPlaneArrival,
    FaShieldAlt,
    FaMapMarkedAlt,
} from "react-icons/fa";

import { motion } from "framer-motion";


function BookingForm({

    bookingData,
    setBookingData,
    errors


}) {
    const toggleService = (service) => {

        const updatedServices =
            bookingData.services.includes(service)
                ? bookingData.services.filter(item => item !== service)
                : [...bookingData.services, service];

        setBookingData({
            ...bookingData,
            services: updatedServices
        });

    };


    return (
        <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="
bg-white/55
backdrop-blur-2xl
border
border-white/30
rounded-[32px]
shadow-[0_20px_60px_rgba(0,0,0,0.15)]
p-8
transition-all
duration-500
"
        >
            <h2 className="text-3xl font-bold text-emerald-900 mb-8">
                Traveller Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                    <label className="block mb-2 font-medium">
                        Full Name <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">

                        <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-700" />

                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={bookingData.name}
                            onChange={(e) =>
                                setBookingData({
                                    ...bookingData,
                                    name: e.target.value
                                })
                            }
                            className="
w-full
rounded-2xl
bg-white/50
backdrop-blur-md
border
border-white/40
pl-14
pr-4
py-4
outline-none
transition-all
duration-300
focus:ring-2
focus:ring-emerald-400
focus:border-emerald-500
placeholder:text-gray-500
"

                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name}
                            </p>
                        )}

                    </div>
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Email <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">

                        <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-700" />


                        <input
                            type="email"
                            placeholder="Enter email"
                            value={bookingData.email}
                            onChange={(e) =>
                                setBookingData({
                                    ...bookingData,
                                    email: e.target.value
                                })
                            }
                            className="
w-full
rounded-2xl
bg-white/50
backdrop-blur-md
border
border-white/40
pl-14
pr-4
py-4
outline-none
transition-all
duration-300
focus:ring-2
focus:ring-emerald-400
focus:border-emerald-500
placeholder:text-gray-500
"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email}
                            </p>
                        )}

                    </div>
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Phone Number <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">

                        <FaPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-700" />


                        <input
                            type="tel"
                            placeholder="Enter phone number"
                            value={bookingData.phone}
                            onChange={(e) =>
                                setBookingData({
                                    ...bookingData,
                                    phone: e.target.value
                                })
                            }
                            className="
w-full
rounded-2xl
bg-white/50
backdrop-blur-md
border
border-white/40
pl-14
pr-4
py-4
outline-none
transition-all
duration-300
focus:ring-2
focus:ring-emerald-400
focus:border-emerald-500
placeholder:text-gray-500
"
                        />

                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.phone}
                            </p>
                        )}

                    </div>
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Number of Travellers
                    </label>

                    <div className="relative">

                        <FaUsers className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-700" />


                        <input
                            type="number"
                            min="1"
                            value={bookingData.travellers}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                setBookingData({
                                    ...bookingData,
                                    travellers: Math.max(1, Number(e.target.value))
                                })
                            }

                            }
                            className="
w-full
rounded-2xl
bg-white/50
backdrop-blur-md
border
border-white/40
pl-14
pr-4
py-4
outline-none
transition-all
duration-300
focus:ring-2
focus:ring-emerald-400
focus:border-emerald-500
placeholder:text-gray-500
"
                        />

                    </div>
                </div>

            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-[28px] shadow-xl p-8 mt-8">

                <h2 className="text-2xl font-bold text-emerald-900 mb-6">
                    Travel Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <label className="block mb-2 font-medium">
                            Departure Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">

                            <FaCalendarAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-700" />

                            <input
                                type="date"
                                value={bookingData.departureDate}
                                onChange={(e) =>
                                    setBookingData({
                                        ...bookingData,
                                        departureDate: e.target.value
                                    })
                                }
                                className="
w-full
rounded-2xl
bg-white/50
backdrop-blur-md
border
border-white/40
pl-14
pr-4
py-4
outline-none
transition-all
duration-300
focus:ring-2
focus:ring-emerald-400
focus:border-emerald-500
placeholder:text-gray-500
"
                            />
                            {errors.departureDate && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.departureDate}
                                </p>
                            )}

                        </div>
                    </div>

                    <div>

                        <div>

                            <h3 className="font-bold text-gray-800 mb-4">

                                Room Type

                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                                <div
                                    onClick={() => setBookingData({
                                        ...bookingData,
                                        roomType: "Standard"
                                    })}
                                    className={`border rounded-2xl p-4 cursor-pointer transition

    ${bookingData.roomType === "Standard"

                                            ? "border-emerald-500 bg-emerald-50 shadow-lg"

                                            : "hover:border-emerald-400 hover:bg-white/70 hover:shadow-lg"
                                        }`}
                                >

                                    <FaBed className="text-2xl text-emerald-600 mb-3" />

                                    <p className="font-semibold">

                                        Standard

                                    </p>

                                </div>

                                <div
                                    onClick={() => setBookingData({
                                        ...bookingData,
                                        roomType: "Deluxe"
                                    })}
                                    className={`border rounded-2xl p-4 cursor-pointer transition

    ${bookingData.roomType === "Deluxe"

                                            ? "border-emerald-500 bg-emerald-50 shadow-lg"

                                            : "hover:border-emerald-400 hover:bg-white/70 hover:shadow-lg"

                                        }`}
                                >

                                    <FaBed className="text-2xl text-emerald-600 mb-3" />

                                    <p className="font-semibold">

                                        Deluxe

                                    </p>

                                </div>

                                <div
                                    onClick={() => setBookingData({
                                        ...bookingData,
                                        roomType: "Suite"
                                    })}
                                    className={`border rounded-2xl p-4 cursor-pointer transition

    ${bookingData.roomType === "Suite"

                                            ? "border-emerald-500 bg-emerald-50 shadow-lg"

                                            : "hover:border-emerald-400 hover:bg-white/70 hover:shadow-lg"

                                        }`}
                                >

                                    <FaBed className="text-2xl text-emerald-600 mb-3" />

                                    <p className="font-semibold">

                                        Suite

                                    </p>

                                </div>

                            </div>

                        </div>
                    </div>

                </div>

            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-[28px] shadow-xl p-8 mt-8">

                <h2 className="text-2xl font-semibold text-emerald-700 mb-6">

                    Additional Services

                </h2>

                <div className="space-y-4">

                    <div

                        onClick={() => toggleService("Airport Pickup")}

                        className={`bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl shadow-sm p-4 flex justify-between items-center cursor-pointer transition

${bookingData.services.includes("Airport Pickup")

                                ? "border-emerald-500 bg-emerald-50 shadow-lg"

                                : "hover:border-emerald-400 hover:bg-white/70 hover:shadow-lg"
                            }`}

                    >
                        <div className="flex items-center gap-3">

                            <FaPlaneArrival className="text-emerald-600" />

                            Airport Pickup

                        </div>

                        <span>Included</span>

                    </div>

                    <div

                        onClick={() => toggleService("Travel Insurance")}

                        className={`bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl shadow-sm p-4 flex justify-between items-center cursor-pointer transition

${bookingData.services.includes("Travel Insurance")

                                ? "border-emerald-500 bg-emerald-50 shadow-lg"

                                : "hover:border-emerald-400 hover:bg-white/70 hover:shadow-lg"
                            }`}

                    >
                        <div className="flex items-center gap-3">

                            <FaShieldAlt className="text-emerald-600" />

                            Travel Insurance

                        </div>

                        <span>₹999</span>

                    </div>

                    <div

                        onClick={() => toggleService("Guided City Tour")}

                        className={`bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl shadow-sm p-4 flex justify-between items-center cursor-pointer transition

${bookingData.services.includes("Guided City Tour")

                                ? "border-emerald-500 bg-emerald-50 shadow-lg"

                                : "hover:border-emerald-400 hover:bg-white/70 hover:shadow-lg"
                            }`}

                    >
                        <div className="flex items-center gap-3">

                            <FaMapMarkedAlt className="text-emerald-600" />

                            Guided City Tour

                        </div>

                        <span>₹1499</span>

                    </div>

                </div>

            </div>

            <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-[28px] shadow-xl p-8 mt-8">

                <label className="block mb-2 font-semibold text-emerald-700">

                    Special Requests

                </label>

                <textarea
                    rows="5"
                    placeholder="Tell us about your travel preferences..."
                    className="w-full
rounded-2xl
bg-white/50
backdrop-blur-md
border
border-white/30
p-5
outline-none
transition-all
duration-300
focus:ring-2
focus:ring-emerald-400
focus:border-emerald-500
placeholder:text-gray-500"
                />

            </div>

        </motion.form>
    );
}

export default BookingForm;
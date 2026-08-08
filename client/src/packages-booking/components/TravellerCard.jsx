import {

    FaUser,

    FaEnvelope,

    FaPhone,

    FaUsers,

    FaCalendarAlt,

    FaBed

} from "react-icons/fa";

function TravellerCard({

    bookingData

}) {

    if (!bookingData) {
        return (
            <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-3xl font-bold mb-4">
                    Traveller Information
                </h2>

                <p className="text-gray-500">
                    No booking data available.
                </p>
            </div>
        );
    }

    return (

        <div className="bg-white/70
                        backdrop-blur-2xl
                        border
                        border-white/40
                        rounded-[32px]
                        shadow-[0_25px_50px_rgba(0,0,0,0.12)]
                        p-8
                        transition-all
                        duration-500
                        hover:-translate-y-1">

            <h2 className="text-3xl font-bold mb-8">

                Traveller Information

            </h2>

            <div className="space-y-5">

                <p>

                    <FaUser className="inline mr-3 text-green-700" />

                    {bookingData.name}

                </p>

                <p>

                    <FaEnvelope className="inline mr-3 text-green-700" />

                    {bookingData.email}

                </p>

                <p>

                    <FaPhone className="inline mr-3 text-green-700" />

                    {bookingData.phone}

                </p>

                <p>

                    <FaUsers className="inline mr-3 text-green-700" />

                    {bookingData.travellers} Travellers

                </p>

                <hr />

                <h3 className="text-xl font-bold">

                    Travel Details

                </h3>

                <p>

                    <FaCalendarAlt className="inline mr-3 text-green-700" />

                    {bookingData.departureDate}

                </p>

                <p>

                    <FaBed className="inline mr-3 text-green-700" />

                    {bookingData.roomType}

                </p>

                <div className="mt-8">

                    <h3 className="font-bold text-xl mb-4">

                        Additional Services

                    </h3>

                    {

                        bookingData.services.length === 0

                            ?

                            <p className="text-gray-400">

                                No services selected

                            </p>

                            :

                            <ul className="space-y-2">

                                {

                                    bookingData.services.map(service => (

                                        <li key={service}>

                                            ✔ {service}

                                        </li>

                                    ))

                                }

                            </ul>

                    }

                </div>

            </div>

        </div>

    );

}

export default TravellerCard;
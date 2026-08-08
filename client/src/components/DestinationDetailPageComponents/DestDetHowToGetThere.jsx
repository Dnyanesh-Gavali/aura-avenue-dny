import React from 'react'

const transportIcons = {
    air: "⌯✈︎",
    train: "🚄",
    road: "🚙"
}
const DestDetHowToGetThere = ({ transport = [] }) => {

    return (
        <>
            <section className="mt-16 p-8 md:p-16 rounded-[50px] bg-emerald-200 shadow-[20px_20px_35px_#ecebeb,-20px_-20px_35px_#ffffff]">
                {/* Section Heading */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                        How to Get There
                    </h2>

                    <p className="mt-2 text-gray-800">
                        Choose the most convenient way to reach your destination.
                    </p>
                </div>

                {/* Transport Cards */}
                <div className="grid gap-6 md:grid-cols-3">

                    {transport.map((item) => (
                        <div
                            key={item.type}
                            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            {/* Icon */}
                            <div className="mb-4 text-4xl">
                                {transportIcons[item.type]}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-semibold">
                                {item.title}
                            </h3>

                            {/* Description */}
                            <p className="mt-3 leading-7 text-gray-900">
                                {item.description}
                            </p>
                        </div>
                    ))}

                </div>
            </section>
        </>
    )
}

export default DestDetHowToGetThere

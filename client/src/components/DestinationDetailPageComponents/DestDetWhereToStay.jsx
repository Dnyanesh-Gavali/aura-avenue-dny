import React from "react";

const stayIcons = {
  luxury: "🏬",
  hotel: "🏢",
  homestay: "🏡",
  hostel: "🛏️",
  villa: "🏖️",
  apartment: "🏠",
};

const DestDetWhereToStay = ({ stayOptions = [] }) => {
  return (
    <section className="mt-16  p-8 md:p-16 rounded-[50px] bg-sky-200 shadow-[20px_20px_35px_#ecebeb,-20px_-20px_35px_#ffffff]">

      {/* Section Heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Where to Stay
        </h2>

        <p className="mt-2 text-gray-800">
          Choose accommodation that matches your comfort and budget.
        </p>
      </div>

      {/* Stay Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {stayOptions.map((option) => (
          <div
            key={option.type}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >

            {/* Icon */}
            <div className="mb-4 text-5xl">
              {stayIcons[option.type]}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900">
              {option.title}
            </h3>

            {/* Description */}
            <p className="mt-3 leading-7 text-black">
              {option.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
};

export default DestDetWhereToStay;
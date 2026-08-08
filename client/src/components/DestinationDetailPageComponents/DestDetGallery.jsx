import React from "react";

const DestDetGallery = () => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">

      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="flex aspect-square items-center justify-center rounded-xl bg-gray-200"
        >
          Image {item}
        </div>
      ))}

    </div>
  );
};

export default DestDetGallery;
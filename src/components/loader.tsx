import type React from "react";
import Load from "../assets/Loader1.gif"

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/40 backdrop-blur-md">
      <div className="flex flex-col items-center justify-center space-y-6 p-8">
        <img
          src={Load}
          alt="Loading..."
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain drop-shadow-sm"
        />
        <div className="text-center space-y-2 max-w-sm">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 tracking-tight">
            Loading Data...
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Please wait while the data is being loaded.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
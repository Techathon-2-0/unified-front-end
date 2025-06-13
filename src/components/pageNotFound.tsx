import React from 'react';
import { Link } from 'react-router-dom';
import ill from '../assets/illustration-404.svg'

const NotFoundView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gray-100">
      {/* Logo (Optional) */}
      {/* <div className="absolute top-6 left-6">
        <img src="/logo.svg" alt="Logo" className="h-10" />
      </div> */}

      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        Sorry, page not found!
      </h1>

      <p className="text-gray-600 text-center max-w-md mb-8">
        Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve mistyped the URL? Be sure to check your spelling.
      </p>

      <img
        src={ill}
        alt="404 Illustration"
        className="w-72 sm:w-96 mb-10 animate-fade-in"
      />

      <Link
        to="/dashboard"
        className="inline-block bg-gray-800 text-white text-sm font-medium px-6 py-3 rounded-full shadow-md hover:bg-black transition duration-300"
      >
        Go to home
      </Link>
    </div>
  );
};

export default NotFoundView;

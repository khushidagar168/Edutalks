// client/src/components/NavbarLanding.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NavbarLanding = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg shadow-md px-8 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-3xl font-extrabold text-indigo-700 tracking-tight">
          EduTalks
        </span>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-700">
        <a
          href="#about"
          className="hover:text-indigo-600 hover:underline transition duration-200"
        >
          About
        </a>
        <a
          href="#features"
          className="hover:text-indigo-600 hover:underline transition duration-200"
        >
          Features
        </a>
        <a
          href="#contact"
          className="hover:text-indigo-600 hover:underline transition duration-200"
        >
          Contact
        </a>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        <Link
          to="/auth"
          className="text-indigo-600 border border-indigo-600 px-4 py-2 rounded-md font-semibold hover:bg-indigo-600 hover:text-white transition duration-200"
        >
          Login
        </Link>
        <Link
          to="/auth"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700 transition duration-200 shadow"
        >
          Register
        </Link>
      </div>
    </nav>
  );
};

export default NavbarLanding;

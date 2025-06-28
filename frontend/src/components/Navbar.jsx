import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Function to highlight active menu item
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-50 dark:bg-gray-900 py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-6">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          <Link to="/">QR Tracker</Link>
        </div>
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className={`hover:underline transition-colors duration-200 ${
              isActive("/")
                ? "font-semibold text-indigo-600 dark:text-indigo-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            Generator
          </Link>
          <Link
            to="/qrcodes"
            className={`hover:underline transition-colors duration-200 ${
              isActive("/qrcodes")
                ? "font-semibold text-indigo-600 dark:text-indigo-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            All QR Codes
          </Link>
          <Link
            to="/analytics"
            className={`hover:underline transition-colors duration-200 ${
              isActive("/analytics")
                ? "font-semibold text-indigo-600 dark:text-indigo-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            Analytics
          </Link>
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Dark Mode"
            className="ml-4 px-4 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

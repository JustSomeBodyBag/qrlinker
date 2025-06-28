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

  // Функция для выделения активного меню
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-100 dark:bg-gray-900 py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
          <Link to="/">QR Tracker</Link>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`hover:underline ${
              isActive("/") ? "font-semibold text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-gray-300"
            }`}
          >
            Генератор
          </Link>
          <Link
            to="/qrcodes"
            className={`hover:underline ${
              isActive("/qrcodes") ? "font-semibold text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-gray-300"
            }`}
          >
            Все QR-коды
          </Link>
          <Link
            to="/analytics"
            className={`hover:underline ${
              isActive("/analytics") ? "font-semibold text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-gray-300"
            }`}
          >
            Аналитика
          </Link>
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Dark Mode"
            className="ml-2 px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm transition-colors duration-300"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

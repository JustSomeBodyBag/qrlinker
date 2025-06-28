import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CreatePage from "./pages/CreatePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import QrListPage from "./pages/QrListPage";
import RedirectPage from "./pages/RedirectPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<CreatePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/qrcodes" element={<QrListPage />} />
            <Route path="/r/:qrId" element={<RedirectPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

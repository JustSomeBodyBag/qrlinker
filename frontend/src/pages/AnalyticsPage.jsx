import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function AnalyticsPage() {
  const [qrcodes, setQrcodes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [stats, setStats] = useState(null);
  const barRef = useRef(null);
  const [barGradient, setBarGradient] = useState(null);

  useEffect(() => {
    axios.get("/api/qrcodes")
      .then(res => setQrcodes(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedId) {
      axios.get(`/api/stats/${selectedId}`)
        .then(res => setStats(res.data))
        .catch(console.error);
    } else {
      setStats(null);
    }
  }, [selectedId]);

  // Создаем градиент после того как canvas будет готов
  useEffect(() => {
  if (barRef.current) {
    const ctx = barRef.current.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.7)");
    gradient.addColorStop(1, "rgba(96, 165, 250, 1)");
    setBarGradient(gradient);
  }
}, []);  // <-- пустой массив зависимостей


  return (
    <div className="max-w-5xl mx-auto p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-extrabold mb-8">📊 QR Code Analytics</h1>

      <select
        className="mb-8 w-full md:w-1/2 p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-colors duration-300"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="" disabled>
          Select a QR Code
        </option>
        {qrcodes.map(qr => (
          <option key={qr.id} value={qr.id}>
            {qr.original_url.length > 60 ? qr.original_url.slice(0, 60) + "..." : qr.original_url}
          </option>
        ))}
      </select>

      {stats ? (
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4">📅 Scans Over Time</h2>
            <Bar
              ref={barRef}
              data={{
                labels: Object.keys(stats.by_date),
                datasets: [{
                  label: "Scans",
                  data: Object.values(stats.by_date),
                  backgroundColor: barGradient || "rgba(59, 130, 246, 0.7)",
                  borderRadius: 8,
                  hoverBackgroundColor: "rgba(96, 165, 250, 1)",
                  barPercentage: 0.6,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true, backgroundColor: "#2563eb", titleFont: {weight: "bold"} },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      color: "#3b82f6",
                      font: { size: 14, weight: "bold" },
                    },
                    grid: { color: "rgba(59,130,246,0.2)" },
                  },
                  x: {
                    ticks: {
                      color: "#2563eb",
                      font: { size: 14, weight: "bold" },
                    },
                    grid: { display: false },
                  },
                },
                animation: {
                  duration: 1000,
                  easing: "easeOutQuart",
                },
              }}
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">📱 Devices</h2>
            <Pie
              data={{
                labels: ["Mobile", "Desktop"],
                datasets: [{
                  data: [stats.devices.mobile, stats.devices.desktop],
                  backgroundColor: [
                    "rgba(59, 130, 246, 0.85)",
                    "rgba(249, 115, 22, 0.85)"
                  ],
                  borderColor: [
                    "rgba(59, 130, 246, 1)",
                    "rgba(249, 115, 22, 1)"
                  ],
                  borderWidth: 2,
                  hoverOffset: 30,
                  hoverBorderColor: "#fff",
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { 
                    position: "bottom",
                    labels: {
                      font: { size: 16, weight: "bold" },
                      color: "#3b82f6",
                    }
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: "#2563eb",
                    titleFont: { weight: "bold" },
                    bodyFont: { size: 14 }
                  },
                },
                animation: {
                  animateRotate: true,
                  duration: 1500,
                  easing: "easeOutQuart",
                },
              }}
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">🌍 Locations</h2>
            {Object.keys(stats.locations).length > 0 ? (
              <ul className="list-disc pl-6 space-y-1 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded p-4 bg-white dark:bg-gray-800 shadow-inner">
                {Object.entries(stats.locations).map(([country, count]) => (
                  <li key={country} className="text-base font-medium">
                    <span className="text-blue-600 dark:text-blue-400">{country}:</span> {count}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-gray-600 dark:text-gray-400">No location data available.</p>
            )}
          </section>
        </div>
      ) : (
        selectedId && <p className="italic text-gray-600 dark:text-gray-400">Loading statistics...</p>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function AnalyticsPage() {
  const [qrcodes, setQrcodes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [stats, setStats] = useState(null);

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
    }
  }, [selectedId]);

  return (
    <div className="text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6">📊 Аналитика QR-кодов</h1>

      <select
        className="mb-6 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        value={selectedId || ""}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="" disabled>Выберите QR-код</option>
        {qrcodes.map(qr => (
          <option key={qr.id} value={qr.id}>
            {qr.original_url.length > 40 ? qr.original_url.slice(0, 40) + "..." : qr.original_url}
          </option>
        ))}
      </select>

      {stats && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">📅 Сканы по дате</h2>
            <Bar
              data={{
                labels: Object.keys(stats.by_date),
                datasets: [{
                  label: "Сканы",
                  data: Object.values(stats.by_date),
                  backgroundColor: "rgba(59, 130, 246, 0.7)"
                }]
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">📱 Устройства</h2>
            <Pie
              data={{
                labels: ["Мобильные", "Десктопы"],
                datasets: [{
                  data: [stats.devices.mobile, stats.devices.desktop],
                  backgroundColor: ["#3b82f6", "#f97316"]
                }]
              }}
              options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">🌍 Локации</h2>
            {Object.keys(stats.locations).length > 0 ? (
              <ul className="list-disc pl-5">
                {Object.entries(stats.locations).map(([country, count]) => (
                  <li key={country}>{country}: {count}</li>
                ))}
              </ul>
            ) : (
              <p>Нет данных о местоположении</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard({ qrId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`/api/stats/${qrId}`).then((res) => setStats(res.data)).catch(console.error);
  }, [qrId]);

  if (!stats) return <div className="text-center text-gray-500 dark:text-gray-300 py-10">Loading data...</div>;

  const dates = Object.keys(stats.by_date).sort();
  const scansByDate = dates.map((d) => stats.by_date[d]);

  const devicesData = {
    labels: ["Mobile", "Desktop"],
    datasets: [
      {
        label: "Scans",
        data: [stats.devices.mobile, stats.devices.desktop],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const dateData = {
    labels: dates,
    datasets: [
      {
        label: "Scans over Time",
        data: scansByDate,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.3,
      },
    ],
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 py-10 bg-white dark:bg-gray-800 rounded-2xl shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">
        Analytics for QR #{qrId}
      </h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        Total Scans: <strong>{stats.total}</strong>
      </p>

      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Scans by Device</h3>
        <Bar data={devicesData} />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Scans by Date</h3>
        <Line data={dateData} />
      </div>
    </motion.div>
  );
}

export default Dashboard;

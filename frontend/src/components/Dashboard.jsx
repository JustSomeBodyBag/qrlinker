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

  if (!stats) return <div>Загрузка данных...</div>;

  const dates = Object.keys(stats.by_date).sort();
  const scansByDate = dates.map((d) => stats.by_date[d]);

  const devicesData = {
    labels: ["Мобильные", "Десктопы"],
    datasets: [
      {
        label: "Переходы",
        data: [stats.devices.mobile, stats.devices.desktop],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const dateData = {
    labels: dates,
    datasets: [
      {
        label: "Переходы по датам",
        data: scansByDate,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto" }}>
      <h2>Аналитика по QR-коду #{qrId}</h2>
      <p>Общее число переходов: {stats.total}</p>

      <div style={{ marginBottom: 40 }}>
        <h3>Переходы по устройствам</h3>
        <Bar data={devicesData} />
      </div>

      <div>
        <h3>Переходы по датам</h3>
        <Line data={dateData} />
      </div>
    </div>
  );
}

export default Dashboard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import config, { loadConfig } from "../api/config";

export default function QrListPage() {
  const [qrcodes, setQrcodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQr, setSelectedQr] = useState({});
  const [error, setError] = useState("");

  // Загрузка всех QR-кодов
  const fetchQrs = async () => {
    try {
      if (!config.BACKEND_DOMAIN) await loadConfig();

      const res = await axios.get(`${config.BACKEND_DOMAIN}/api/qrcodes`);
      setQrcodes(res.data);
    } catch (err) {
      console.error(err);
      setError("Ошибка при загрузке QR-кодов");
    } finally {
      setLoading(false);
    }
  };

  // Загрузка изображения QR-кода
  const fetchQrImage = async (id) => {
    try {
      const res = await axios.get(`/api/qrcode-image/${id}?redirect=true`);
      setSelectedQr(prev => ({ ...prev, [id]: res.data.qr_image_base64 }));
    } catch (err) {
      console.error("Не удалось получить QR изображение", err);
    }
  };

  // Удаление QR-кода
  const deleteQr = async (id) => {
    try {
      await axios.delete(`${config.BACKEND_DOMAIN}/api/qrcodes/${id}`);
      setQrcodes(qrcodes.filter(qr => qr.id !== id));
    } catch (err) {
      console.error("Ошибка при удалении QR-кода", err);
      alert("Ошибка при удалении QR-кода");
    }
  };

  useEffect(() => {
    fetchQrs();
  }, []);

  if (loading) {
    return <p className="text-gray-700 dark:text-gray-300">🔄 Загрузка QR-кодов...</p>;
  }

  return (
    <div className="text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6">📋 Все сгенерированные QR-коды</h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {qrcodes.map((qr) => (
          <div key={qr.id} className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 shadow">
            <p className="truncate font-semibold mb-2">{qr.original_url}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Создан: {new Date(qr.created_at).toLocaleString()}
            </p>

            <div className="mb-2 flex flex-wrap gap-2">
              <button
                onClick={() => fetchQrImage(qr.id)}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Показать QR-код
              </button>
              <button
                onClick={() => deleteQr(qr.id)}
                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Удалить
              </button>
            </div>

            {selectedQr[qr.id] && (
              <img
                src={`data:image/png;base64,${selectedQr[qr.id]}`}
                alt={`QR ${qr.id}`}
                className="my-3 w-40 h-40 object-contain border rounded bg-white"
              />
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              <a
                href={`/r/${qr.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm px-4 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
              >
                Перейти
              </a>
              <a
                href={`/analytics?qr=${qr.id}`}
                className="text-sm px-4 py-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded"
              >
                Аналитика
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

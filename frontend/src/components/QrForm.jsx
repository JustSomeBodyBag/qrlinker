import React, { useState, useEffect } from "react";
import axios from "axios";
import config, { loadConfig } from "../api/config";

function QrForm() {
  const [data, setData] = useState("");
  const [color, setColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [boxSize, setBoxSize] = useState(10);
  const [border, setBorder] = useState(4);

  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [error, setError] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState(""); // Ссылка с сервера

  useEffect(() => {
    if (!config.BACKEND_DOMAIN) {
      loadConfig();
    }
  }, []);

  function normalizeInput(input) {
    const trimmed = input.trim();
    if (
      trimmed.match(/^(https?:\/\/)/i) ||
      trimmed.match(/^[a-zA-Z0-9]+\.[a-zA-Z]{2,}/) === null
    ) {
      return trimmed;
    }
    return "https://" + trimmed;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQrImage(null);
    setGeneratedUrl("");

    if (!data.trim()) {
      setError("Пожалуйста, введите данные для генерации QR-кода");
      setLoading(false);
      return;
    }

    const normalized = normalizeInput(data);

    const payload = {
      url: normalized,
      color,
      bg_color: bgColor,
      box_size: boxSize,
      border,
    };

    try {
      const response = await axios.post(`${config.BACKEND_DOMAIN}/api/generate`, payload);
      setQrImage(response.data.qr_image_base64);
      setGeneratedUrl(response.data.short_url); // <-- Вот тут ссылка из ответа сервера
    } catch {
      setError("Ошибка генерации QR-кода");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md"
    >
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
        Введите URL или любой текст для кодирования:
      </label>
      <textarea
        rows={3}
        placeholder="Например: https://example.com или просто 'Привет мир!'"
        className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
            Цвет QR-кода:
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 p-0 border rounded cursor-pointer"
            aria-label="Цвет QR-кода"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
            Цвет фона:
          </label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-full h-10 p-0 border rounded cursor-pointer"
            aria-label="Цвет фона"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
            Размер квадратиков:
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={boxSize}
            onChange={(e) => setBoxSize(Number(e.target.value))}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            aria-label="Размер квадратиков"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
            Толщина границы:
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={border}
            onChange={(e) => setBorder(Number(e.target.value))}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            aria-label="Толщина границы"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !config.BACKEND_DOMAIN}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold disabled:opacity-50 transition"
      >
        {loading ? "Генерируем..." : "Создать QR-код"}
      </button>

      {error && <p className="mt-2 text-red-500 text-center">{error}</p>}

      {qrImage && (
        <div className="mt-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            Ваш QR-код
          </h3>
          <img
            src={`data:image/png;base64,${qrImage}`}
            alt="QR код"
            className="inline-block border border-gray-300 dark:border-gray-600"
          />
          <div className="mt-2">
            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-words"
            >
              {generatedUrl}
            </a>
          </div>
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = `data:image/png;base64,${qrImage}`;
              link.download = "qrcode.png";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded font-semibold transition"
          >
            Скачать PNG
          </button>
        </div>
      )}
    </form>
  );
}

export default QrForm;

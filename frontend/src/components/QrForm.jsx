import React, { useState, useEffect } from "react";
import axios from "axios";
import config, { loadConfig } from "../api/config";
import { Download, Clipboard } from "lucide-react";

function QrForm() {
  const [data, setData] = useState("");
  const [color, setColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [boxSize, setBoxSize] = useState(10);
  const [border, setBorder] = useState(4);

  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [shortUrl, setShortUrl] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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
    setShortUrl(null);

    if (!data.trim()) {
      setError("Please enter something to generate QR code.");
      setLoading(false);
      return;
    }

    const payload = {
      url: normalizeInput(data),
      color,
      bg_color: bgColor,
      box_size: boxSize,
      border,
    };

    try {
      const response = await axios.post(
        `${config.BACKEND_DOMAIN}/api/generate`,
        payload
      );
      setQrImage(response.data.qr_image_base64);
      setShortUrl(response.data.short_url);
    } catch {
      setError("Failed to generate QR code.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrImage) return;
    const a = document.createElement("a");
    a.href = `data:image/png;base64,${qrImage}`;
    a.download = "qr-code.png";
    a.click();
  };

  const copyToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        Generate a QR Code
      </h2>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          URL or Text
        </label>
        <textarea
          rows={3}
          placeholder="e.g. https://example.com"
          className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            QR Color
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 p-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Background Color
          </label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-full h-10 p-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Box Size
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={boxSize}
            onChange={(e) => setBoxSize(Number(e.target.value))}
            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Border
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={border}
            onChange={(e) => setBorder(Number(e.target.value))}
            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !config.BACKEND_DOMAIN}
        className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate QR Code"}
      </button>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {qrImage && (
        <div className="mt-6 text-center space-y-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
            Your QR Code
          </h3>

          <img
            src={`data:image/png;base64,${qrImage}`}
            alt="QR Code"
            className="inline-block border border-gray-300 dark:border-gray-600 rounded-lg"
          />

          <div className="flex justify-center gap-3">
            <button
              onClick={handleDownload}
              type="button"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
          </div>

          {shortUrl && (
            <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline break-all"
              >
                {shortUrl}
              </a>
              <button
                onClick={copyToClipboard}
                type="button"
                className="hover:text-blue-800 dark:hover:text-white transition"
                title="Copy to clipboard"
              >
                <Clipboard className="w-4 h-4" />
              </button>
              {copied && (
                <span className="text-sm text-green-500 ml-2">Copied!</span>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
}

export default QrForm;

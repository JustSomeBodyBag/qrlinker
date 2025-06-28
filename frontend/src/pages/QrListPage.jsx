import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function QrCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loadingImages, setLoadingImages] = useState({}); // для загрузки base64 картинок

  useEffect(() => {
    axios.get("/api/qrcodes")
      .then(res => {
        setCodes(res.data);
        // Загрузка base64 для каждого QR-кода
        res.data.forEach(code => {
          axios.get(`/api/qrcode-image/${code.id}`)
            .then(resp => {
              setLoadingImages(prev => ({
                ...prev,
                [code.id]: resp.data.qr_image_base64
              }));
            })
            .catch(console.error);
        });
      })
      .catch(console.error);
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  const downloadQr = (base64, filename) => {
    const link = document.createElement("a");
    link.href = base64;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteQrCode = (id) => {
    if (!window.confirm("Are you sure you want to delete this QR code?")) return;
    axios.delete(`/api/qrcodes/${id}`)
      .then(() => {
        setCodes(codes.filter(code => code.id !== id));
        setLoadingImages(prev => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      })
      .catch(() => alert("Failed to delete QR code"));
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">All QR Codes</h1>

      {codes.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No QR codes yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {codes.map(code => {
            const base64 = loadingImages[code.id];
            const imageSrc = base64 ? `data:image/png;base64,${base64}` : null;
            const frontendDomain = window.location.origin;
            const shortUrl = `${frontendDomain}/r/${code.id}`;

            return (
              <motion.div
                key={code.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-md transition relative flex flex-col"
                whileHover={{ scale: 1.02 }}
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={`QR for ${code.original_url}`}
                    className="w-full h-auto mb-4 rounded-xl border dark:border-gray-700"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4 flex items-center justify-center">
                    Loading...
                  </div>
                )}

                <p className="text-sm text-gray-700 dark:text-gray-300 truncate mb-1">
                  <strong>Original URL:</strong> {code.original_url}
                </p>

                <div className="flex items-center justify-between gap-2 text-sm mb-3">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                    title={shortUrl}
                  >
                    {shortUrl}
                  </a>
                  <button
                    onClick={() => copyToClipboard(shortUrl)}
                    className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Copy
                  </button>
                </div>

                <div className="mt-auto flex justify-between items-center">
                  <button
                    onClick={() => base64 && downloadQr(`data:image/png;base64,${base64}`, `qr_${code.id}.png`)}
                    disabled={!base64}
                    className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Download
                  </button>

                  <Link
                    to={`/analytics/`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Analytics →
                  </Link>

                  <button
                    onClick={() => deleteQrCode(code.id)}
                    className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default QrCodesPage;

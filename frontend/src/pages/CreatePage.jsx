import React from "react";
import QrForm from "../components/QrForm";
import { motion } from "framer-motion";

function CreatePage() {
  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Create QR Code
      </h1>
      <QrForm />
    </motion.div>
  );
}

export default CreatePage;

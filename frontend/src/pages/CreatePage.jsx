import React from "react";
import QrForm from "../components/QrForm";

function CreatePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Создать QR-код</h1>
      <QrForm />
    </div>
  );
}

export default CreatePage;

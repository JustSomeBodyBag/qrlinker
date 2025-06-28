import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

function RedirectPage() {
  const { qrId } = useParams();
  const navigate = useNavigate();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return; // если уже вызвали — пропускаем

    calledRef.current = true;

    async function fetchRedirect() {
      try {
        const res = await fetch(`/api/redirect/${qrId}`);
        if (!res.ok) throw new Error("QR not found");
        const data = await res.json();

        // Отправляем событие сканирования
        await fetch("/api/record-scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            qr_id: qrId,
            user_agent: navigator.userAgent,
            // IP не отправляем, сервер возьмёт из заголовков
          }),
        });

        if (data.type === "url") {
          window.location.href = data.content; // Переходим на URL
        } else {
          alert(data.content); // Показываем текст
          navigate("/"); // Возвращаем на главную
        }
      } catch (error) {
        console.error("Redirect error:", error);
        navigate("/"); // Если ошибка — редирект на главную
      }
    }

    fetchRedirect();
  }, [qrId, navigate]);

  return <div>Переадресация...</div>;
}

export default RedirectPage;

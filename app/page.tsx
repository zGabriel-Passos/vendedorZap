"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

type Status = "disconnected" | "connecting" | "qr" | "connected" | "error";

export default function Home() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("disconnected");
  const eventSourceRef = useRef<EventSource | null>(null);

  const statusLabel: Record<Status, string> = {
    disconnected: "Desconectado",
    connecting: "Conectando...",
    qr: "Aguardando leitura do QR code...",
    connected: "Conectado! Aguardando mensagens...",
    error: "Erro na conexão",
  };

  function closeSSE() {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }

  const handleConnect = () => {
    setStatus("connecting");
    setQrCode(null);
    closeSSE();

    const es = new EventSource("/api/whatsapp/connect");
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.status) setStatus(data.status as Status);
      if (data.qr) {
        setQrCode(
          `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.qr)}`
        );
      }
      if (data.status === "connected") {
        setQrCode(null);
        closeSSE();
      }
    };

    es.onerror = () => {
      setStatus("error");
      closeSSE();
    };
  };

  const handleDisconnect = async () => {
    closeSSE();
    await fetch("/api/whatsapp/disconnect", { method: "POST" });
    setQrCode(null);
    setStatus("disconnected");
  };

  useEffect(() => () => closeSSE(), []);

  const isConnected = status === "connected";
  const isConnecting = status === "connecting" || status === "qr";

  return (
    <div className="flex flex-col items-center justify-center bg-zinc-50 dark:bg-black min-h-screen font-sans px-4">
      <main className="w-full max-w-lg flex flex-col items-center gap-8 py-14 px-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-5xl">🤖</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Vendedor Zap</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs">
            Agente de IA para vendas no WhatsApp com integração AbacatePay
          </p>
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          isConnected
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : isConnecting
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
            : status === "error"
            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : isConnecting ? "bg-yellow-500 animate-pulse" : "bg-zinc-400"
          }`} />
          {statusLabel[status]}
        </div>

        {/* QR Code */}
        {status === "qr" && qrCode && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              📱 Abra o WhatsApp → Dispositivos conectados → Conectar dispositivo
            </p>
            <div className="p-3 bg-white rounded-xl shadow-md border border-zinc-100">
              <Image
                src={qrCode}
                alt="QR Code WhatsApp"
                width={200}
                height={200}
                unoptimized
              />
            </div>
          </div>
        )}

        {/* Connected info */}
        {isConnected && (
          <div className="w-full bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-sm text-green-800 dark:text-green-300 text-center">
            ✅ Bot ativo! Compartilhe o número com seus clientes para começar a vender.
          </div>
        )}

        {/* Features list */}
        {!isConnecting && !isConnected && (
          <ul className="w-full space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            {[
              "🛍️ Catálogo de produtos (iPhone, MacBook, AirPods...)",
              "🛒 Carrinho via linguagem natural",
              "💳 Pagamento via AbacatePay (PIX)",
              "📦 Confirmação automática de pedido",
              "🤖 IA com Groq (Llama 3)",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">{f}</li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="flex flex-col w-full gap-3">
          {!isConnected && !isConnecting && (
            <button
              onClick={handleConnect}
              className="w-full h-12 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Conectar WhatsApp
            </button>
          )}

          {isConnecting && (
            <button
              onClick={handleDisconnect}
              className="w-full h-12 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
          )}

          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="w-full h-12 rounded-full border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Desconectar
            </button>
          )}
        </div>

        {/* Slash commands hint */}
        <div className="w-full border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center mb-2">Comandos disponíveis no WhatsApp</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["/ajuda", "/produtos", "/carrinho", "/historico", "/frete", "/reset"].map((cmd) => (
              <span key={cmd} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono text-zinc-600 dark:text-zinc-400">
                {cmd}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

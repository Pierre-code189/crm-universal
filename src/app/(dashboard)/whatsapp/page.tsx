"use client";

import { useState } from "react";
import { QrCode, CheckCircle2, RefreshCw, Bot, Smartphone } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

export default function WhatsAppPage() {
  const { tenant } = useTenant();
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSimulateQR = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setIsConnected(true);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Módulo de Vinculación WhatsApp (Bot QR)</h2>
        <p className="text-slate-600 text-sm">
          Sincroniza tu dispositivo para activar la atención automatizada por Inteligencia Artificial (Llama + Groq).
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${isConnected ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              Estado de la Conexión: {isConnected ? "Conectado" : "Pendiente de Vinculación"}
            </h3>
            <p className="text-xs text-slate-500">
              {isConnected
                ? "Bot de WhatsApp operando activamente para " + tenant.name
                : "Escanea el código QR a continuación desde tu aplicación de WhatsApp"}
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          isConnected ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
        }`}>
          {isConnected ? "EN LÍNEA" : "DESCONECTADO"}
        </span>
      </div>

      {/* Main Grid: QR Scanner & Bot Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <h3 className="font-bold text-slate-900 text-base mb-2">Código QR de Sincronización</h3>
          <p className="text-xs text-slate-500 mb-6">
            Abre WhatsApp en tu teléfono &gt; Dispositivos vinculados &gt; Vincular dispositivo.
          </p>

          {!isConnected ? (
            <div className="border-2 border-dashed border-slate-300 p-6 rounded-2xl bg-slate-50 flex flex-col items-center justify-center mb-6">
              <QrCode className="w-48 h-48 text-slate-800 mb-2" />
              <p className="text-xs text-slate-400">El código se actualiza periódicamente</p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 p-8 rounded-2xl flex flex-col items-center justify-center mb-6 w-full">
              <CheckCircle2 className="w-16 h-16 text-green-600 mb-3" />
              <p className="font-bold text-green-800 text-sm">¡Dispositivo Vinculado con Éxito!</p>
              <p className="text-xs text-green-600 mt-1">Llama + Groq API activo a &lt;100ms latencia</p>
            </div>
          )}

          {!isConnected ? (
            <button
              onClick={handleSimulateQR}
              disabled={isRefreshing}
              className="bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Simulando lectura QR..." : "Simular Escaneo QR"}
            </button>
          ) : (
            <button
              onClick={() => setIsConnected(false)}
              className="bg-red-50 text-red-600 text-sm font-semibold px-6 py-2.5 rounded-lg border border-red-200 hover:bg-red-100 transition"
            >
              Desconectar WhatsApp
            </button>
          )}
        </div>

        {/* Bot Config */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-blue-600 font-bold mb-2">
            <Bot className="w-5 h-5" />
            <h3>Configuración del Asistente IA</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mensaje de Bienvenida Automático
            </label>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-3 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
              rows={3}
              defaultValue={`¡Hola! Gracias por contactar a ${tenant.name}. ¿En qué podemos ayudarte hoy?`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Modelo de Lenguaje (NLP Engine)
            </label>
            <input
              type="text"
              disabled
              value="Llama 3 (vía Groq API - Ultra Baja Latencia)"
              className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-600 font-mono"
            />
          </div>

          <div className="pt-2">
            <button className="w-full bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-slate-800 transition">
              Guardar Configuración del Bot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
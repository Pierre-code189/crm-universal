"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    subdomain: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`¡Bienvenido a NexCRM! Se ha iniciado tu prueba gratuita de 14 días para ${formData.companyName}.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
          Inicia tu Trial de 14 Días
        </h2>
        <p className="text-slate-600 text-sm text-center mb-6">
          Acceso total sin necesidad de tarjeta de crédito.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Ej. Juan Pérez"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="juan@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Empresa</label>
            <input
              type="text"
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Inmobiliaria Hábitat"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subdominio Deseado</label>
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
              <input
                type="text"
                required
                className="w-full p-2.5 text-sm outline-none"
                placeholder="habitat"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
              />
              <span className="bg-slate-100 text-slate-500 text-xs px-3 py-3 border-l">
                .nex-crm.com
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-6"
          >
            Activar Prueba Gratuita (14 Días)
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          <Link href="/" className="text-blue-600 hover:underline">
            Volver a la página principal
          </Link>
        </p>
      </div>
    </div>
  );
}
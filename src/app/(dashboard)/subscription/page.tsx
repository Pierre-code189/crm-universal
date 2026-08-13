"use client";

import { useTenant } from "@/context/TenantContext";
import { Check, ShieldCheck } from "lucide-react";

export default function SubscriptionPage() {
  const { tenant } = useTenant();

  const handleCheckout = (planName: string) => {
    alert(`Redirigiendo a la pasarela de Stripe para contratar el plan ${planName}...`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gestión de Planes & Suscripción</h2>
        <p className="text-slate-600 text-sm">
          Administra la suscripción recurrente gestionada por la API de Stripe.
        </p>
      </div>

      {/* Active Plan Overview */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-3 py-1 rounded-full">
            Plan Actual
          </span>
          <h3 className="text-3xl font-extrabold mt-2 capitalize">{tenant.plan}</h3>
          <p className="text-blue-100 text-xs mt-1">Inquilino: {tenant.name} ({tenant.subdomain}.nex-crm.com)</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-blue-200">Estado de la suscripción</span>
          <p className="font-bold text-sm flex items-center justify-end gap-1 text-green-300 mt-1">
            <ShieldCheck className="w-4 h-4" /> Activo / Facturación Stripe
          </p>
        </div>
      </div>

      {/* Upgrade Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Basic */}
        <div className={`bg-white border rounded-2xl p-6 flex flex-col justify-between ${
          tenant.plan === "basic" ? "border-blue-600 ring-2 ring-blue-600/20" : "border-slate-200"
        }`}>
          <div>
            <h4 className="font-bold text-lg text-slate-900">Plan Basic</h4>
            <p className="text-slate-500 text-xs mb-4">Emprendedores e independientes.</p>
            <ul className="space-y-2 text-xs text-slate-600 mb-6">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> CRM Completo</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> 1 Usuario</li>
            </ul>
          </div>
          <button
            onClick={() => handleCheckout("Basic")}
            disabled={tenant.plan === "basic"}
            className="w-full py-2.5 rounded-lg font-bold text-xs border border-slate-300 hover:bg-slate-50 transition"
          >
            {tenant.plan === "basic" ? "Plan Activo" : "Cambiar a Basic"}
          </button>
        </div>

        {/* Pro */}
        <div className={`bg-white border-2 rounded-2xl p-6 flex flex-col justify-between relative shadow-sm ${
          tenant.plan === "pro" ? "border-blue-600 ring-2 ring-blue-600/20" : "border-blue-500"
        }`}>
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
            RECOMENDADO
          </span>
          <div>
            <h4 className="font-bold text-lg text-slate-900">Plan Pro</h4>
            <p className="text-slate-500 text-xs mb-4">Equipos en crecimiento.</p>
            <ul className="space-y-2 text-xs text-slate-600 mb-6">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Hasta 5 Usuarios</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Bot IA WhatsApp (Llama)</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Motor White-Label</li>
            </ul>
          </div>
          <button
            onClick={() => handleCheckout("Pro")}
            disabled={tenant.plan === "pro"}
            className="w-full py-2.5 rounded-lg font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {tenant.plan === "pro" ? "Plan Activo" : "Upgrade a Pro"}
          </button>
        </div>

        {/* Enterprise */}
        <div className={`bg-white border rounded-2xl p-6 flex flex-col justify-between ${
          tenant.plan === "enterprise" ? "border-blue-600 ring-2 ring-blue-600/20" : "border-slate-200"
        }`}>
          <div>
            <h4 className="font-bold text-lg text-slate-900">Plan Enterprise</h4>
            <p className="text-slate-500 text-xs mb-4">Empresas consolidadas.</p>
            <ul className="space-y-2 text-xs text-slate-600 mb-6">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Hasta 10 Usuarios</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Reportes & Analytics</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Soporte VIP Dedicado</li>
            </ul>
          </div>
          <button
            onClick={() => handleCheckout("Enterprise")}
            disabled={tenant.plan === "enterprise"}
            className="w-full py-2.5 rounded-lg font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            {tenant.plan === "enterprise" ? "Plan Activo" : "Upgrade a Enterprise"}
          </button>
        </div>
      </div>
    </div>
  );
}
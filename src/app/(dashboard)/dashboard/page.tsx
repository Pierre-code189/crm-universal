"use client";

import { useTenant } from "@/context/TenantContext";
import { Users, DollarSign, TrendingUp, PhoneCall } from "lucide-react";

export default function DashboardPage() {
  const { tenant } = useTenant();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Bienvenido a {tenant.name}
        </h2>
        <p className="text-slate-600 text-sm">
          Gestión centralizada para la industria de <span className="font-semibold capitalize">{tenant.industry.replace('_', ' ')}</span>.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Clientes</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">128</p>
          <span className="text-xs text-green-600 font-medium">+12% este mes</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500">Oportunidades</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">34</p>
          <span className="text-xs text-slate-500">En pipeline activo</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500">Ventas Proyectadas</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">$24,500</p>
          <span className="text-xs text-green-600 font-medium">Meta del trimestre</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500">Respuestas WhatsApp</span>
            <PhoneCall className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">98.4%</p>
          <span className="text-xs text-teal-600 font-medium">Bot IA activo</span>
        </div>
      </div>
    </div>
  );
}
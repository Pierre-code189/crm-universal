"use client";

import { Plus, MoreHorizontal, DollarSign } from "lucide-react";

const COLUMNS = [
  { id: "prospects", title: "Prospectos" },
  { id: "contacted", title: "Contactado" },
  { id: "proposal", title: "Propuesta Enviada" },
  { id: "won", title: "Ganado" },
];

const MOCK_DEALS = [
  { id: "1", title: "Proyecto Residencia Lima", client: "Constructora Norte", value: 12000, stage: "prospects" },
  { id: "2", title: "Servicios de Consultoría", client: "Tech Solutions", value: 4500, stage: "contacted" },
  { id: "3", title: "Licenciamiento Anual", client: "Grupo Sanidad", value: 8000, stage: "proposal" },
  { id: "4", title: "Contrato Mantenimiento", client: "Inmobiliaria Real", value: 3200, stage: "won" },
];

export default function PipelinesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pipeline de Ventas</h2>
          <p className="text-slate-600 text-sm">Gestión visual del embudo comercial por etapas.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> Nueva Oportunidad
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {COLUMNS.map((column) => {
          const dealsInColumn = MOCK_DEALS.filter((d) => d.stage === column.id);
          return (
            <div key={column.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col min-h-125">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">{column.title}</h3>
                <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {dealsInColumn.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {dealsInColumn.map((deal) => (
                  <div key={deal.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{deal.title}</h4>
                      <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{deal.client}</p>
                    <div className="flex items-center text-xs font-bold text-emerald-600">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{deal.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
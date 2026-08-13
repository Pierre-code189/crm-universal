"use client";

import { Plus, Mail, Phone } from "lucide-react";

const MOCK_CONTACTS = [
  { id: "1", name: "Carlos Mendoza", email: "carlos@constructora.com", phone: "+51 987 654 321", company: "Constructora Norte", status: "Cliente" },
  { id: "2", name: "Ana Lucía Torres", email: "ana@techsolutions.com", phone: "+51 912 345 678", company: "Tech Solutions", status: "Prospecto" },
  { id: "3", name: "Roberto Gómez", email: "roberto@sanidad.com", phone: "+51 955 443 322", company: "Grupo Sanidad", status: "Cliente" },
];

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clientes & Contactos</h2>
          <p className="text-slate-600 text-sm">Directorio centralizado de contactos por inquilino.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> Agregar Contacto
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Contacto</th>
              <th className="p-4">Empresa</th>
              <th className="p-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_CONTACTS.map((contact) => (
              <tr key={contact.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-semibold text-slate-900">{contact.name}</td>
                <td className="p-4 space-y-1">
                  <div className="flex items-center text-xs text-slate-600 gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {contact.email}</div>
                  <div className="flex items-center text-xs text-slate-600 gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {contact.phone}</div>
                </td>
                <td className="p-4 text-slate-700">{contact.company}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    contact.status === "Cliente" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {contact.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
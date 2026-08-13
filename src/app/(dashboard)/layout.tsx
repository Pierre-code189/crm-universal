"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  QrCode, 
  CreditCard,
  Building2 
} from "lucide-react";
import { useTenant, TenantProvider } from "@/context/TenantContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { tenant } = useTenant();

const navItems = [
  { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes & Contactos", href: "/contacts", icon: Users },
  { name: "Pipelines de Ventas", href: "/pipelines", icon: Kanban },
  { name: "Bot WhatsApp (QR)", href: "/whatsapp", icon: QrCode },
  { name: "Planes & Suscripción", href: "/subscription", icon: CreditCard },
];

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4">
        <div>
          {/* Tenant Header */}
          <div className="flex items-center space-x-3 mb-8 px-2 py-3 bg-slate-50 rounded-xl border">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div className="overflow-hidden">
              <h2 className="font-bold text-sm text-slate-900 truncate">{tenant.name}</h2>
              <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full capitalize">
                {tenant.plan}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="border-t pt-4 px-2 text-xs text-slate-500">
          Subdominio: <span className="font-mono text-slate-700">{tenant.subdomain}</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-bold text-slate-800">Panel de Control</h1>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-500">Inquilino Activo:</span>
            <span className="text-sm font-semibold text-blue-600">{tenant.name}</span>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <DashboardContent>{children}</DashboardContent>
    </TenantProvider>
  );
}
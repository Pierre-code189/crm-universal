"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Tenant } from "@/types/tenant";
import { MOCK_TENANTS } from "@/lib/mockTenants";

interface TenantContextType {
  tenant: Tenant;
  setTenant: (tenant: Tenant) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({
  children,
  initialSubdomain = "default",
}: {
  children: React.ReactNode;
  initialSubdomain?: string;
}) {
  const [tenant, setTenant] = useState<Tenant>(
    MOCK_TENANTS[initialSubdomain] || MOCK_TENANTS.default
  );

  useEffect(() => {
    // Inyectar variables CSS dinámicas para personalizar colores por Tenant
    document.documentElement.style.setProperty(
      "--color-primary",
      tenant.theme.primaryColor
    );
    document.documentElement.style.setProperty(
      "--color-secondary",
      tenant.theme.secondaryColor
    );

    // Actualizar título del documento
    document.title = `${tenant.name} - CRM Universal`;
  }, [tenant]);

  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant debe usarse dentro de un TenantProvider");
  }
  return context;
}
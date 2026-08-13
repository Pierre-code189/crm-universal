import { Tenant } from "@/types/tenant";

export const MOCK_TENANTS: Record<string, Tenant> = {
  default: {
    id: "tenant-default",
    name: "NexCRM Base",
    subdomain: "app",
    industry: "services",
    plan: "pro",
    theme: {
      primaryColor: "#2563eb", // Azul por defecto
      secondaryColor: "#1e40af",
      logoUrl: "/logo-default.svg",
      faviconUrl: "/favicon.ico",
    },
    active: true,
  },
  habitat: {
    id: "tenant-inmobiliaria",
    name: "Inmobiliaria Hábitat",
    subdomain: "habitat",
    industry: "real_estate",
    plan: "pro",
    theme: {
      primaryColor: "#059669", // Verde esmeralda
      secondaryColor: "#065f46",
      logoUrl: "https://via.placeholder.com/150x50/059669/FFFFFF?text=Habitat",
      faviconUrl: "/favicon.ico",
    },
    active: true,
  },
  sanfernando: {
    id: "tenant-salud",
    name: "Clínica San Fernando",
    subdomain: "sanfernando",
    industry: "healthcare",
    plan: "enterprise",
    theme: {
      primaryColor: "#0284c7", // Azul cian clínico
      secondaryColor: "#075985",
      logoUrl: "https://via.placeholder.com/150x50/0284c7/FFFFFF?text=San+Fernando",
      faviconUrl: "/favicon.ico",
    },
    active: true,
  },
};
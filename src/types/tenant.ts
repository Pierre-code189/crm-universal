export type IndustryType = 'real_estate' | 'healthcare' | 'commerce' | 'services' | 'education';
export type PlanType = 'basic' | 'pro' | 'enterprise';

export interface TenantTheme {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  industry: IndustryType;
  plan: PlanType;
  theme: TenantTheme;
  active: boolean;
}
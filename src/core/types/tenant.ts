// src/core/types/tenant.ts
import type { ModuleSchema } from './schema';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface Tenant {
  id: string;
  name: string;
  themeColor: string;
  firebaseConfig: FirebaseConfig;
  modules: Record<string, ModuleSchema>; // ¡NUEVO! Aquí guardaremos sus tablas
}
// src/infrastructure/database/firebaseManager.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app'; 
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth'; 
import type { FirebaseConfig } from '../../core/types/tenant';

// ==========================================
// 1. EL CEREBRO DINÁMICO (Para tus Clientes - ¡Intocable!)
// ==========================================
export interface TenantFirebaseServices {
  db: Firestore;
  auth: Auth;
}

export const getTenantFirebase = (tenantId: string, config: FirebaseConfig): TenantFirebaseServices => {
  let app: FirebaseApp;
  const existingApps = getApps();
  const appExists = existingApps.find(a => a.name === tenantId);

  if (appExists) {
    app = getApp(tenantId);
  } else {
    app = initializeApp(config, tenantId);
  }

  return {
    db: getFirestore(app),
    auth: getAuth(app)
  };
};

// ==========================================
// 2. LA BÓVEDA CENTRAL (Para el CRM Universal y Súper Admin)
// ==========================================
// Aquí debes pegar las credenciales del proyecto de Firebase que creaste EXCLUSIVAMENTE para tu CRM
const masterFirebaseConfig = {
  apiKey: "AIzaSyC8DKxAXqOf9X1hMIuJFLei0lRc5OdlnnY",
  authDomain: "crm-universal-3bbeb.firebaseapp.com",
  projectId: "crm-universal-3bbeb",
  storageBucket: "crm-universal-3bbeb.firebasestorage.app",
  messagingSenderId: "831168024092",
  appId: "1:831168024092:web:e354aae4948df4483999d9"
};

// Iniciamos el Motor Principal del Súper Administrador
export const masterApp = initializeApp(masterFirebaseConfig, "MasterCRM");
export const masterAuth = getAuth(masterApp);
export const masterDb = getFirestore(masterApp);

// Iniciamos el Motor Fantasma para enviar invitaciones en secreto
export const secondaryApp = initializeApp(masterFirebaseConfig, "SecondaryCRM");
export const secondaryAuth = getAuth(secondaryApp);

// Al final de src/infrastructure/database/firebaseManager.ts
export const db = masterDb;
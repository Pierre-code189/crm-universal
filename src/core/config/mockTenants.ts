import type { Tenant } from '../types/tenant';

const realFirebaseConfig = {
  apiKey: "AIzaSyC8DKxAXqOf9X1hMIuJFLei0lRc5OdlnnY",
  authDomain: "crm-universal-3bbeb.firebaseapp.com",
  projectId: "crm-universal-3bbeb",
  storageBucket: "crm-universal-3bbeb.firebasestorage.app",
  messagingSenderId: "831168024092",
  appId: "1:831168024092:web:e354aae4948df4483999d9"
};

export const TENANTS_DB: Record<string, Tenant> = {
  chocopiura: {
    id: 'chocopiura',
    name: 'ChocoPiura',
    themeColor: '#4b2c20',
    firebaseConfig: realFirebaseConfig,
    modules: {
      inventario: {
        collectionName: 'productos',
        title: 'Inventario de Chocotejas',
        fields: [
          { name: 'sabor', label: 'Sabor', type: 'text' },
          { name: 'precio', label: 'Precio (S/)', type: 'number' },
          { name: 'stock', label: 'Cantidad en Stock', type: 'number' }
        ]
      }
    }
  },
  novaweb: {
    id: 'novaweb',
    name: 'Agencia NovaWeb',
    themeColor: '#2563eb',
    firebaseConfig: realFirebaseConfig,
    modules: {
      clientes: {
        collectionName: 'clientes_agencia',
        title: 'Directorio de Clientes',
        fields: [
          { name: 'empresa', label: 'Empresa', type: 'text' },
          { name: 'servicio', label: 'Servicio Contratado', type: 'text' },
          { name: 'mensualidad', label: 'Pago Mensual ($)', type: 'number' }
        ]
      }
    }
  }
};
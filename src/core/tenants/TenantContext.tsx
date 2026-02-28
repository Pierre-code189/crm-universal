// src/core/tenants/TenantContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { masterDb, getTenantFirebase } from '../../infrastructure/database/firebaseManager';
import { createRepository } from '../../infrastructure/repositories/coreRepository';
import type { Firestore } from 'firebase/firestore';

// 🛠️ 1. Importamos la interfaz correcta en lugar de usar 'any'
import type { Tenant } from '../types/tenant'; 

type RepositoryType = ReturnType<typeof createRepository>;

interface TenantContextType {
  tenant: Tenant | null; // <-- Reemplazamos any por Tenant
  isLoading: boolean;
  db: Firestore | null;
  repository: RepositoryType | null;
}

const TenantContext = createContext<TenantContextType>({} as TenantContextType);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  
  // 🛠️ 2. Tipamos el estado de React
  const [tenant, setTenant] = useState<Tenant | null>(null); 
  const [db, setDb] = useState<Firestore | null>(null);
  const [repository, setRepository] = useState<RepositoryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarConfiguracionCliente = async () => {
      if (authLoading) {
        setIsLoading(true);
        return;
      }
      
      if (!user) {
        setTenant(null);
        setDb(null);
        setRepository(null);
        setIsLoading(false);
        return;
      }

      // 🛠️ 3. Usamos la variable de entorno para el Admin
      if (user.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const q = query(collection(masterDb, "clientes_config"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const clienteData = docSnap.data();

          if (clienteData.configuracionSaaS) {
            // TypeScript ahora sabe que configJSON tiene la forma de 'Tenant'
            const configJSON = clienteData.configuracionSaaS as Tenant; 
            setTenant(configJSON); 

            const tenantServices = getTenantFirebase(docSnap.id, configJSON.firebaseConfig);
            setDb(tenantServices.db);
            setRepository(createRepository(tenantServices.db));
          } else {
            console.warn("⚠️ El cliente no tiene configuración cargada.");
          }
        }
      } catch (error) {
        console.error("❌ Error de red en Firestore:", error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarConfiguracionCliente();
  }, [user, authLoading]);

  return (
    <TenantContext.Provider value={{ tenant, isLoading, db, repository }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
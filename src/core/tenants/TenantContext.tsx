// src/core/tenants/TenantContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { masterDb, getTenantFirebase } from '../../infrastructure/database/firebaseManager';
import { createRepository } from '../../infrastructure/repositories/coreRepository';
import type { Firestore } from 'firebase/firestore';

type RepositoryType = ReturnType<typeof createRepository>;

interface TenantContextType {
  tenant: any | null;
  isLoading: boolean;
  db: Firestore | null;
  repository: RepositoryType | null;
}

const TenantContext = createContext<TenantContextType>({} as TenantContextType);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [tenant, setTenant] = useState<any | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [repository, setRepository] = useState<RepositoryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarConfiguracionCliente = async () => {
      // 1. Si el AuthContext está cargando, ponemos el Tenant en espera también
      if (authLoading) {
        setIsLoading(true);
        return;
      }
      
      // 2. Si Auth terminó y NO hay usuario
      if (!user) {
        setTenant(null);
        setDb(null);
        setRepository(null);
        setIsLoading(false);
        return;
      }

      // 3. Si eres el Admin, terminamos la carga aquí (tú no usas JSON de cliente)
      if (user.email === "giancordova9@gmail.com") {
        setIsLoading(false);
        return;
      }

      // 4. BÚSQUEDA DEL ADN DEL CLIENTE
      setIsLoading(true);
      try {
        console.log("🔍 SENSOR: Buscando configuración para:", user.email);
        const q = query(collection(masterDb, "clientes_config"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const clienteData = docSnap.data();

          if (clienteData.configuracionSaaS) {
            const configJSON = clienteData.configuracionSaaS;
            setTenant(configJSON); 

            // Conexión dinámica
            const tenantServices = getTenantFirebase(docSnap.id, configJSON.firebaseConfig);
            setDb(tenantServices.db);
            setRepository(createRepository(tenantServices.db));
            
            console.log("🌟 SENSOR: ¡Mutación exitosa! Entorno cargado.");
          } else {
            console.warn("⚠️ El cliente no tiene configuración cargada.");
          }
        } else {
          console.error("❌ El correo no está registrado en el Búnker.");
        }
      } catch (error) {
        console.error("❌ Error de red en Firestore:", error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarConfiguracionCliente();
  }, [user, authLoading]); // Reacciona inmediatamente al cambio de login

  return (
    <TenantContext.Provider value={{ tenant, isLoading, db, repository }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);